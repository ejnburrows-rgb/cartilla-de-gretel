# Product Map — La Cartilla de Gretel Classroom Platform

This project is one classroom platform with three clear product areas. Routes can exist in code, but the user experience should feel focused.

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Public entry page. |
| `/cartilla` | Main Cartilla platform page. |
| `/cartilla/lecciones` | Index for the 24 student workbook lessons. |
| `/cartilla/leccion/:n` | Public student workbook lesson page. Does not require assignment or class code. |
| `/book` | Official PDF reference when needed. |

## Student routes

| Route | Purpose |
| --- | --- |
| `/cartilla/unirse` | Optional class-code join flow for students who have a teacher code. |
| `/cartilla/mi-progreso` | Student progress view after joining a class or using local mode. |
| `/cartilla/repaso` | Student review/practice path when progress exists. |
| `/cartilla/practica` | Quick practice path. |

## Teacher routes

| Route | Purpose |
| --- | --- |
| `/cartilla/teacher` | Teacher classroom CRM dashboard. |
| `/cartilla/teacher/clase/:id` | Class detail, roster, assignments, progress. |
| `/cartilla/teacher/alumno/:id` | Student detail. |
| `/cartilla/teacher/presentacion` | Teacher lesson readiness/presentation overview. |
| `/cartilla/teacher/flipchart` | Projected teacher flipchart/class follow-along book. |

## Internal teacher tools

| Route | Purpose |
| --- | --- |
| `/cartilla/teacher/remaster-review` | Internal review of original vs remastered images. Not student-facing. |
| `/cartilla/teacher/branding` | Internal/project branding work. |

## Current rule

The student workbook is public and can be explored without a class code. Class codes and assignments add classroom tracking, but they are not required to read the workbook.

## Do not show to students

- Remaster review workflow
- Teacher flipchart administration
- CRM internal details
- Source mapping metadata
- Hotspot/cutout readiness statuses
- Production/remaster approval statuses
