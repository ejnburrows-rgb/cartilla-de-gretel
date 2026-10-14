import json
import shutil

import numpy as np
import pytest

from generate_gretel import ClipJob, chunks_for_text, generate_batch, load_script


def speech_like(text):
    sr = 24000
    t = np.arange(sr)/sr
    signal = (.09*np.sin(2*np.pi*220*t)).astype("float32")
    signal[-int(sr*.12):] = 0
    return sr, signal


def test_phrase_splitting_never_loses_syllables():
    sentence = "¿Escuchaste la sílaba? Ahora toca el dibujo correcto. Vamos a intentarlo juntos."
    assert " ".join(chunks_for_text(sentence,35)) == sentence


def test_script_rejects_duplicate_and_skips_unverified_pages(tmp_path):
    source = tmp_path/"script.csv"
    source.write_text("clip_id,lesson,page,text_es\nGR0001,1,86,Unknown\nGR0002,1,2,Hola\n",encoding="utf-8")
    assert [j.clip_id for j in load_script(source)] == ["GR0002"]
    source.write_text("clip_id,lesson,page,text_es\nGR0001,1,2,Hola\nGR0001,1,3,Adios\n",encoding="utf-8")
    with pytest.raises(ValueError, match="duplicate"):
        load_script(source)


@pytest.mark.skipif(not shutil.which("ffmpeg"),reason="ffmpeg unavailable")
def test_manifest_checkpoint_and_selective_resume(tmp_path):
    calls=[]
    def synthesize(text):
        calls.append(text)
        return speech_like(text)
    out=tmp_path/"clips"; manifest=tmp_path/"manifest.json"
    jobs=[ClipJob("GR0001","Hola, Gretel.","1","1"),ClipJob("GR0002","Escucha y repite.","2","1")]
    first=generate_batch(jobs,out,manifest,synthesize,reference_fingerprint="ref-a")
    assert first["completed"]==2
    assert first["needs_transcript_review"]==2
    state=json.loads(manifest.read_text())
    assert len(state["entries"])==2
    assert all(x["status"]=="needs_transcript_review" for x in state["entries"])
    assert len(calls)==2
    again=generate_batch(jobs,out,manifest,synthesize,reference_fingerprint="ref-a")
    assert again["skipped"]==2 and len(calls)==2
    broken=out/state["entries"][0]["files"][0]
    broken.write_bytes(b"broken"*70)
    replay=generate_batch(jobs,out,manifest,synthesize,reference_fingerprint="ref-a")
    assert replay["completed"]==1 and replay["skipped"]==1 and len(calls)==3


@pytest.mark.skipif(not shutil.which("ffmpeg"),reason="ffmpeg unavailable")
def test_reference_or_text_change_invalidates_cache(tmp_path):
    seen=[]
    def f(x):
        seen.append(x)
        return speech_like(x)
    out=tmp_path/"clips";m=tmp_path/"manifest.json"
    generate_batch([ClipJob("GR0001","Hola")],out,m,f,reference_fingerprint="voiceA")
    generate_batch([ClipJob("GR0001","Hola")],out,m,f,reference_fingerprint="voiceB")
    generate_batch([ClipJob("GR0001","Adiós")],out,m,f,reference_fingerprint="voiceB")
    assert seen==["Hola","Hola","Adiós"]


@pytest.mark.skipif(not shutil.which("ffmpeg"),reason="ffmpeg unavailable")
def test_asr_retries_missing_end_of_sentence(tmp_path):
    calls=[]; asr_calls=[]
    def f(t):
        calls.append(t)
        return speech_like(t)
    def asr(p):
        asr_calls.append(str(p))
        return "Escucha" if len(asr_calls)==1 else "Escucha la sílaba"
    result=generate_batch([ClipJob("GR0001","Escucha la sílaba")],
                          tmp_path/"clips",tmp_path/"manifest.json",f,
                          transcribe=asr,max_attempts=3)
    assert result["needs_owner_review"]==1 and len(calls)==2
    state=json.loads((tmp_path/"manifest.json").read_text())["entries"][0]
    assert state["parts"][0]["status"]=="asr_passed"
    assert state["parts"][0]["attempts"]==2


@pytest.mark.skipif(not shutil.which("ffmpeg"),reason="ffmpeg unavailable")
def test_stop_after_limit_even_if_all_fail(tmp_path):
    seen=[]
    def failed(t):
        seen.append(t)
        return 24000,np.zeros(24000,dtype="float32")
    result=generate_batch([ClipJob("GR0001","Hola"),ClipJob("GR0002","Adiós")],
                          tmp_path/"clips",tmp_path/"m.json",failed,max_attempts=2,limit=1)
    assert result["failed"]==1
    assert len(seen)==2
    assert len(json.loads((tmp_path/"m.json").read_text())["entries"])==1


def test_refuses_direct_public_generation(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    with pytest.raises(ValueError,match="private staging"):
        generate_batch([], "public/audio/gretel/clips",tmp_path/"m.json",speech_like)


def test_cannot_write_private_candidates_anywhere_inside_public(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    with pytest.raises(ValueError, match="private staging"):
        generate_batch([], "public/audio/gretel/other", tmp_path/"m.json", speech_like)
    with pytest.raises(ValueError, match="public playback manifest"):
        generate_batch([], tmp_path/"clips", "src/data/gretel-recorded-manifest.json", speech_like)
