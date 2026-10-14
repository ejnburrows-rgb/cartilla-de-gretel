from pathlib import Path
import json, hashlib, subprocess, collections

ROOT=Path(subprocess.check_output(['git','rev-parse','--show-toplevel']).decode().strip())
PROOF=ROOT/'docs/proofs/artwork-coverage-2026-10-14'
SHA='c03dadfa80967e89fa716db664fb305c6617ae9b'
BASE='153c7eccbec5bc1090cd130a909f0cf73630415a'
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
def digest(b): return hashlib.sha256(b).hexdigest()
manifest_bytes=git('show',f'{SHA}:docs/proofs/artwork-coverage-2026-10-14/coverage-manifest.json')
m=json.loads(manifest_bytes)
assert git('hash-object',str(PROOF/'coverage-manifest.json')).strip()==git('rev-parse',f'{SHA}:docs/proofs/artwork-coverage-2026-10-14/coverage-manifest.json').strip()
checks=[]
for pdf in sorted({r['source_pdf'] for r in m['illustrations']}):
 expected={r['source_pdf_sha256'] for r in m['illustrations'] if r['source_pdf']==pdf}
 actual=digest(Path(pdf).read_bytes())
 checks.append({'source':Path(pdf).name,'expected_sha256':list(expected),'actual_sha256':actual,'unchanged':expected=={actual}})
rows=[]; candidates={}; crop_failures=[]
for r in m['illustrations']:
 crop=PROOF/r['source_crop']
 actual=digest(crop.read_bytes())
 if actual!=r['source_crop_sha256']: crop_failures.append(r['illustration_id'])
 c=r.get('optimized_candidate')
 if c and c.get('source_group')=='github-current-main':
  path=c['location']
  if path not in candidates:
   at_source=git('show',f'{BASE}:{path}');at_input=git('show',f'{SHA}:{path}')
   matches=digest(at_input)==c['sha256']
   crlf_match=digest(at_input.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n'))==c['sha256']
   candidates[path]={'path':path,'expected_sha256':c['sha256'],'source_revision_sha256':digest(at_source),'input_revision_sha256':digest(at_input),'unchanged_between_git_revisions':at_source==at_input,'manifest_matches_committed_bytes':matches,'manifest_matches_lf_to_crlf_checkout_bytes':crlf_match,'unchanged':at_source==at_input and (matches or crlf_match),'sha256_domain_note':'Manifest recorded Windows checkout bytes; exact Git blob hash differs solely by verified LF to CRLF conversion' if not matches and crlf_match else None}
 gaps=list(r.get('uncertainties',[]))
 gaps.append('Authoritative manifest classification is '+r['classification'])
 if c and c['location'] in candidates and not candidates[c['location']]['manifest_matches_committed_bytes']:
  gaps.append('Candidate manifest SHA-256 uses Windows CRLF checkout bytes, not GitHub LF blob bytes; correct the hash-domain metadata in a subsequent coverage revision')
 rows.append({'illustration_id':r['illustration_id'],'book':r['book'],'printed_page':r['printed_page'],'pdf_page_index':r['pdf_page_index'],'subject_or_scene_proposal':r.get('confirmed_source_label',r.get('label_proposal')),'classification':r['classification'],'eligible_for_integration':False,'eligible_for_missing_gallery':False,'approved_source':None,'canonical_production_destination':None,'mapping_proposal':r.get('runtime_mapping'),'evidence_gaps':gaps,'corrective_actions':['Resolve drawing identity, full crop boundaries and repeated placements in the coverage manifest','Link explicit approval evidence for the exact candidate bytes before integration','For a missing classification, finish source examination and independent second comparison before gallery inclusion']})
production_changes=git('diff','--name-only',BASE,SHA,'--','src','public','scripts','tests').decode().splitlines()
report={'schema_version':'1.0','completion_gate':'NOT PASSED','authoritative_input':{'commit':SHA,'path':'docs/proofs/artwork-coverage-2026-10-14/coverage-manifest.json','sha256':digest(manifest_bytes),'baseline_commit':BASE,'manifest_unchanged':True},'source_integrity':{'pdf_checks':checks,'crop_records_checked':len(rows),'crop_hash_failures':crop_failures,'production_candidate_files_checked':len(candidates),'production_candidate_checks':list(candidates.values()),'pass':all(x['unchanged'] for x in checks) and all(x['unchanged'] for x in candidates.values()) and not crop_failures},'reconciliation':{'unique_approved_optimized_illustrations_certified':0,'unique_illustrations_integrated_and_production_verified_by_this_work':0,'additional_production_placements_updated_through_reuse':0,'unique_illustrations_awaiting_optimization_certified_missing':0,'unique_illustrations_requiring_review':None,'provisional_placements_requiring_review':len(rows),'definitive_unique_inventory':None,'explanation':'All 330 records remain NEEDS REVIEW. Unique totals are unknown until drawing identity and repeated placements are consolidated; zero certified approved or missing items does not mean none exist. Existing production artwork is not recertified by this report.'},'production_changes':{'mapping_change_commit':None,'changed_production_files':production_changes,'existing_artwork_overwritten_by_this_work':False,'integrated_illustration_records':[]},'validation':{'source_integrity_command':'python docs/proofs/artwork-coverage-2026-10-14/integration-intake-verifier.py','asset_validation':'NOT RUN: no eligible mapping changes; sparse audit checkout is not a complete release environment','required_asset_commands_after_eligibility':['pnpm audit:art','pnpm verify:assets'],'regression_tests':'NOT RUN: no implementation change; select existing regression tests for actual changed placements after eligibility','browser_production_screenshots':'NOT CAPTURED: no eligible integration or exact deployed revision was established','missing_gallery':'NOT CREATED: authoritative input contains zero verified MISSING OPTIMIZATION records; existing comparison gallery is a review gallery'},'blocking_artwork_records':rows,'corrective_sequence':['Complete coverage identity and repeated-use reconciliation','Establish approved exact-byte optimized sources and verified missing classifications','Freeze the corrected input manifest at its GitHub SHA and reverify source hashes','Update eligible canonical mappings; run existing asset validation and relevant regressions','Verify real workbook and flipchart pages at the same revision; capture page and viewport identified screenshots','Render and browser-test only verified missing crops in an accessible gallery','Publish commit-specific reconciliation and evidence links']}
assert not production_changes,production_changes
(PROOF/'production-integration-gate.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'source_integrity':report['source_integrity']['pass'],'pdf_files_checked':len(checks),'crop_records_checked':len(rows),'production_candidate_files_checked':len(candidates),'eligible_approved':0,'verified_missing':0,'gate':'NOT PASSED'}))
if not report['source_integrity']['pass']:
 print(json.dumps({'failed_pdfs':[x for x in checks if not x['unchanged']],'failed_crops':crop_failures,'failed_candidates':[x for x in candidates.values() if not x['unchanged']]}))
 raise SystemExit(1)

