# 01 - Modelagem de Dados

## Entidades principais

### User

Representa o usuario do sistema.

```text
id
name
email
passwordHash
createdAt
updatedAt
```

### Company

Representa uma empresa.

```text
id
name
website
sector
location
notes
createdAt
updatedAt
```

### JobApplication

Representa uma candidatura.

```text
id
userId
companyId
title
area
level
workMode
location
contractType
sourcePlatform
jobUrl
description
status
resumeVersionId
fitScore
foundAt
appliedAt
lastResponseAt
nextAction
followUpAt
notes
createdAt
updatedAt
```

## Enums sugeridos

### Area

```text
BACKEND
DEVOPS
CLOUD
FULLSTACK
FRONTEND
DATA
SECURITY
OTHER
```

### Level

```text
INTERNSHIP
TRAINEE
JUNIOR
MID
SENIOR
UNKNOWN
```

### WorkMode

```text
REMOTE
HYBRID
ONSITE
UNKNOWN
```

### Status

```text
SAVED
APPLIED
RECRUITER_CONTACTED
IN_REVIEW
TEST_SENT
HR_INTERVIEW
TECH_INTERVIEW
WAITING_RESPONSE
REJECTED
GHOSTED
OFFER
ARCHIVED
```

### SourcePlatform

```text
LINKEDIN
GUPY
COMPANY_SITE
INDEED
GLASSDOOR
GREENHOUSE
LEVER
ASHBY
REFERRAL
OTHER
```

### ResumeVersion

Versoes diferentes do curriculo.

```text
id
userId
name
language
focus
fileUrl
notes
createdAt
updatedAt
```

### Interaction

Historico de contato com empresa/recrutador.

```text
id
applicationId
type
contactName
contactRole
contactUrl
happenedAt
description
createdAt
updatedAt
```

### Reminder

Lembretes de follow-up.

```text
id
applicationId
title
dueAt
done
createdAt
updatedAt
```

