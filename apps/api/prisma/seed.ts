import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const backendResume = await prisma.resumeVersion.upsert({
    where: { id: "seed-resume-backend-ptbr" },
    update: {},
    create: {
      id: "seed-resume-backend-ptbr",
      name: "Back-end PT-BR",
      language: "PT_BR",
      focus: "BACKEND",
      notes: "Curriculo focado em Node.js, Go, APIs, SQL e Docker.",
    },
  });

  const devopsResume = await prisma.resumeVersion.upsert({
    where: { id: "seed-resume-devops-en" },
    update: {},
    create: {
      id: "seed-resume-devops-en",
      name: "Cloud/DevOps EN",
      language: "EN",
      focus: "DEVOPS",
      notes: "Resume focused on Docker, Linux, GitHub Actions and AWS EC2.",
    },
  });

  const tcs = await prisma.company.upsert({
    where: { name: "Tata Consultancy Services" },
    update: {},
    create: {
      name: "Tata Consultancy Services",
      sector: "IT Services",
      location: "Remote - Brazil",
    },
  });

  const cappta = await prisma.company.upsert({
    where: { name: "Cappta" },
    update: {},
    create: {
      name: "Cappta",
      sector: "Fintech",
      location: "Remote - Brazil",
    },
  });

  await prisma.jobApplication.upsert({
    where: { id: "seed-application-tcs-devops" },
    update: {},
    create: {
      id: "seed-application-tcs-devops",
      companyId: tcs.id,
      resumeVersionId: devopsResume.id,
      title: "DevOps Engineer",
      area: "DEVOPS",
      level: "JUNIOR",
      workMode: "REMOTE",
      contractType: "CLT",
      sourcePlatform: "LINKEDIN",
      status: "APPLIED",
      fitScore: 72,
      appliedAt: new Date(),
      nextAction: "Enviar mensagem para recrutadora no LinkedIn",
      notes: "Vaga pede Linux, Docker, GitHub Actions, Bash/Python e observabilidade.",
    },
  });

  await prisma.jobApplication.upsert({
    where: { id: "seed-application-cappta-internship" },
    update: {},
    create: {
      id: "seed-application-cappta-internship",
      companyId: cappta.id,
      resumeVersionId: backendResume.id,
      title: "Estagio em Tecnologia",
      area: "BACKEND",
      level: "INTERNSHIP",
      workMode: "REMOTE",
      contractType: "INTERNSHIP",
      sourcePlatform: "GUPY",
      status: "SAVED",
      fitScore: 86,
      nextAction: "Customizar resumo da candidatura",
      notes: "Programa de estagio com foco em tecnologia, produto e impacto real.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
