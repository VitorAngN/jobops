/**
 * Dicionário de competências técnicas. Cada item tem o nome que aparece na tela
 * e as formas como costuma aparecer em vagas (sem acento, minúsculas).
 * Comparar por dicionário evita contar palavras soltas como "empresa" ou "time".
 */
export type Skill = { name: string; group: SkillGroup; aliases: string[] };
export type SkillGroup = "linguagem" | "backend" | "frontend" | "dados" | "devops" | "cloud" | "infra" | "pratica";

const s = (name: string, group: SkillGroup, ...aliases: string[]): Skill => ({ name, group, aliases: [name.toLowerCase(), ...aliases] });

export const SKILLS: Skill[] = [
  // Linguagens
  s("Java", "linguagem"),
  s("Python", "linguagem"),
  s("C#", "linguagem", "c sharp", "csharp"),
  s("C++", "linguagem", "cpp"),
  s("C", "linguagem", "linguagem c"),
  s("JavaScript", "linguagem", "js", "ecmascript"),
  s("TypeScript", "linguagem", "ts"),
  s("Go", "linguagem", "golang"),
  s("PHP", "linguagem"),
  s("Kotlin", "linguagem"),
  s("Ruby", "linguagem"),
  s("Rust", "linguagem"),
  s("Bash", "linguagem", "shell script", "shell"),
  s("PowerShell", "linguagem"),
  // Back-end
  s("Node.js", "backend", "node", "nodejs", "node js"),
  s("Express", "backend", "expressjs"),
  s(".NET", "backend", "dotnet", "asp.net", "asp net", "net core"),
  s("Spring", "backend", "spring boot", "springboot"),
  s("Django", "backend"),
  s("FastAPI", "backend"),
  s("Flask", "backend"),
  s("Laravel", "backend"),
  s("APIs REST", "backend", "rest", "restful", "api rest", "apis rest", "api", "apis"),
  s("GraphQL", "backend"),
  s("Microsserviços", "backend", "microsservicos", "microservices", "microsservico", "microservice"),
  s("Mensageria", "backend", "rabbitmq", "kafka", "filas", "sqs", "mensageria"),
  s("WebSocket", "backend", "websockets", "socket.io"),
  s("Prisma", "backend"),
  s("Entity Framework", "backend", "ef core"),
  // Front-end
  s("React", "frontend", "reactjs", "react.js"),
  s("Angular", "frontend"),
  s("Vue", "frontend", "vuejs", "vue.js"),
  s("Next.js", "frontend", "nextjs"),
  s("HTML", "frontend", "html5"),
  s("CSS", "frontend", "css3", "sass", "tailwind"),
  // Dados
  s("SQL", "dados"),
  s("PostgreSQL", "dados", "postgres"),
  s("MySQL", "dados"),
  s("SQL Server", "dados", "sqlserver", "mssql"),
  s("Oracle", "dados"),
  s("MongoDB", "dados", "mongo"),
  s("Redis", "dados"),
  s("Power BI", "dados", "powerbi"),
  // DevOps
  s("Docker", "devops", "containers", "conteineres", "container"),
  s("Kubernetes", "devops", "k8s"),
  s("CI/CD", "devops", "ci cd", "integracao continua", "entrega continua", "pipelines", "pipeline"),
  s("GitHub Actions", "devops"),
  s("GitLab CI", "devops"),
  s("Jenkins", "devops"),
  s("Terraform", "devops", "infraestrutura como codigo", "iac"),
  s("Ansible", "devops"),
  s("Git", "devops", "github", "gitlab", "versionamento"),
  s("Observabilidade", "devops", "monitoramento", "grafana", "prometheus", "logs", "datadog"),
  s("Nginx", "devops"),
  // Cloud
  s("AWS", "cloud", "amazon web services", "ec2", "s3", "lambda"),
  s("Azure", "cloud", "microsoft azure"),
  s("GCP", "cloud", "google cloud"),
  // Infra / suporte
  s("Linux", "infra", "ubuntu", "debian", "centos", "red hat"),
  s("Windows Server", "infra", "active directory", "ad"),
  s("Redes", "infra", "tcp/ip", "tcp ip", "dns", "dhcp", "vpn", "roteamento", "switches", "networking"),
  s("Suporte técnico", "infra", "suporte tecnico", "help desk", "helpdesk", "service desk", "atendimento ao usuario", "chamados"),
  s("Hardware", "infra", "manutencao de computadores", "montagem"),
  s("ITIL", "infra"),
  s("Segurança", "infra", "seguranca da informacao", "firewall", "cybersecurity"),
  // Práticas
  s("Testes automatizados", "pratica", "testes", "testes unitarios", "jest", "vitest", "junit", "xunit", "tdd"),
  s("Scrum", "pratica", "metodologias ageis", "agil", "kanban", "ageis"),
  s("Clean Code", "pratica", "solid", "clean architecture", "boas praticas"),
  s("Inglês", "pratica", "ingles", "english"),
];
