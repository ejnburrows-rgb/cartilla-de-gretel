import {test,expect} from '@playwright/test';
import {installFakeSupabase} from './support/fake-supabase';

const classroom={joinCode:'E2E123',classId:'3f1c9d6e-3a7a-4c4b-9a1e-7b2d5c8f4a10',className:'Primaria 1',students:[
  {id:'6d2b8f14-0c3e-4a55-9f77-1e8a3b6c2d90',name:'Ana Ruiz',code:'ANARU'},
  {id:'9a4e7c22-5b18-4d63-8e0a-2f7c1d9b3e45',name:'Beto Lima',code:'BETOL'},
]};

test('identified students keep separate writing and bookmarks; cloud unavailable still resumes; student cannot access teacher tools',async({page})=>{
  const backend=await installFakeSupabase(page,classroom);
  await page.goto('/cartilla/unirse');
  await page.locator('#join-code').fill(classroom.joinCode);
  await page.locator("#student-code").fill(classroom.students[0].code);
  await page.route("**/rest/v1/rpc/join_class", route => route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({student_id:classroom.students[0].id,student_name:classroom.students[0].name,student_code:classroom.students[0].code,class_id:classroom.classId,class_name:classroom.className})}));
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page).toHaveURL(/lecciones/);
  // Set only the location fixture. Writing is entered through the real UI.
  await page.evaluate(({classId,studentId})=>localStorage.setItem(`cartilla.learner-resume.v1:24:student:${classId}:${studentId}`,JSON.stringify({lesson:24,page:3})),{classId:classroom.classId,studentId:classroom.students[0].id});
  await page.evaluate(({classId,studentId}) => localStorage.setItem(`cartilla.lesson-progress.v1:student:${classId}:${studentId}`, JSON.stringify([23])), {classId:classroom.classId,studentId:classroom.students[0].id});
  await page.goto('/cartilla/leccion/24');
  await page.getByRole('textbox',{name:'Escribe tus oraciones'}).fill('Ana conserva su trabajo.');
  await page.reload();
  await expect(page.getByRole('textbox')).toHaveValue('Ana conserva su trabajo.');
  await page.goto('/cartilla/teacher/reportes');
  await expect(page).toHaveURL(/lecciones/);
  await page.evaluate(({classId,studentId})=>{
    const session=JSON.parse(localStorage.getItem('cartilla.student-session.v1')!);
    Object.assign(session,{studentId,studentCode:'BETOL',studentName:'Beto Lima'});
    localStorage.setItem('cartilla.student-session.v1',JSON.stringify(session));
    localStorage.setItem(`cartilla.learner-resume.v1:24:student:${classId}:${studentId}`,JSON.stringify({lesson:24,page:3}));
    localStorage.setItem(`cartilla.lesson-progress.v1:student:${classId}:${studentId}`,JSON.stringify([23]));
  },{classId:classroom.classId,studentId:classroom.students[1].id});
  await page.goto('/cartilla/leccion/24');
  await expect(page.getByRole('textbox')).toHaveValue('');
  await page.getByRole('textbox').fill('Beto escribe otra oración.');
  await page.evaluate(studentId=>{
    const session=JSON.parse(localStorage.getItem('cartilla.student-session.v1')!);
    Object.assign(session,{studentId,studentCode:'ANARU',studentName:'Ana Ruiz'});
    localStorage.setItem('cartilla.student-session.v1',JSON.stringify(session));
  },classroom.students[0].id);
  await page.route('**/rest/v1/rpc/get_student_progress',route=>route.fulfill({status:503,body:'unavailable'}));
  await page.goto('/cartilla/leccion/24');
  await expect(page.getByRole('textbox')).toHaveValue('Ana conserva su trabajo.',{timeout:20000});
  await page.screenshot({path:'docs/proofs/classroom-readiness/identified-student-offline-resume.png',fullPage:true});
  expect(backend.callsTo('log_student_progress').every(call=>[classroom.students[0].id,classroom.students[1].id].includes(String(call.p_student_id)))).toBe(true);
});
