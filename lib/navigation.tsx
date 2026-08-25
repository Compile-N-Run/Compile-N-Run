import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

export type NavigationItem = { text: string; url: string };
export type NavigationGroup = { text: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  {
    text: 'Fundamentals',
    items: [
      { text: 'Data Structure & Algorithm', url: '/docs/fundamental/algorithm' },
      { text: 'Computer Networks', url: '/docs/fundamental/network' },
      { text: 'Database & Information System', url: '/docs/fundamental/database' },
      { text: 'Operating System', url: '/docs/fundamental/os' },
      { text: 'Interview Preparation', url: '/docs/fundamental/interview' },
    ],
  },
  {
    text: 'Languages',
    items: [
      { text: 'Python', url: '/docs/language/python' },
      { text: 'Java', url: '/docs/language/java' },
      { text: 'JavaScript', url: '/docs/language/javascript' },
      { text: 'TypeScript', url: '/docs/language/typescript' },
      { text: 'Go', url: '/docs/language/go' },
      { text: 'C#', url: '/docs/language/c-sharp' },
      { text: 'C# - .NET', url: '/docs/framework/dotnet' },
      { text: 'C', url: '/docs/language/c' },
      { text: 'C++', url: '/docs/language/cpp' },
      { text: 'Rust', url: '/docs/language/rust' },
      { text: 'SQL', url: '/docs/language/sql' },
      { text: 'PHP', url: '/docs/language/php' },
      { text: 'Kotlin', url: '/docs/language/kotlin' },
      { text: 'Swift', url: '/docs/language/swift' },
    ],
  },
  {
    text: 'Web',
    items: [
      { text: 'Frontend - JavaScript', url: '/docs/language/javascript' },
      { text: 'Frontend - TypeScript', url: '/docs/language/typescript' },
      { text: 'Frontend - Angular', url: '/docs/framework/angular' },
      { text: 'Frontend - React', url: '/docs/framework/react' },
      { text: 'Frontend - Vue.js', url: '/docs/framework/vue' },
      { text: 'Backend - Django', url: '/docs/framework/django' },
      { text: 'Backend - Flask', url: '/docs/framework/flask' },
      { text: 'Backend - FastAPI', url: '/docs/framework/fastapi' },
      { text: 'Backend - Spring', url: '/docs/framework/spring' },
      { text: 'Backend - Express', url: '/docs/framework/express' },
      { text: 'Backend - Gin', url: '/docs/framework/gin' },
      { text: 'Backend - Echo', url: '/docs/framework/echo' },
      { text: 'Backend - PHP', url: '/docs/language/php' },
      { text: 'Full Stack - Next.js', url: '/docs/framework/nextjs' },
      { text: 'CMS - WordPress', url: '/docs/framework/wordpress' },
    ],
  },
  {
    text: 'Observability',
    items: [
      { text: 'Grafana', url: '/docs/observability/grafana' },
      { text: 'Prometheus', url: '/docs/observability/prometheus' },
      { text: 'Loki', url: '/docs/observability/loki' },
    ],
  },
  {
    text: 'Data & AI',
    items: [
      { text: 'Python', url: '/docs/language/python' },
      { text: 'Python - Pandas', url: '/docs/library/pandas' },
      { text: 'Python - PyTorch', url: '/docs/library/pytorch' },
      { text: 'Python - TensorFlow', url: '/docs/library/tensorflow' },
    ],
  },
  {
    text: 'Mobile',
    items: [
      { text: 'Android - Java', url: '/docs/language/java' },
      { text: 'Android - Kotlin', url: '/docs/language/kotlin' },
      { text: 'iOS - Swift', url: '/docs/language/swift' },
    ],
  },
  {
    text: 'Linux',
    items: [
      { text: 'C', url: '/docs/language/c' },
      { text: 'C++', url: '/docs/language/cpp' },
      { text: 'Rust', url: '/docs/language/rust' },
      { text: 'Ubuntu', url: '/docs/os/ubuntu' },
      { text: 'Debian', url: '/docs/os/debian' },
    ],
  },
  {
    text: 'Databases',
    items: [
      { text: 'Redis', url: '/docs/middleware/redis' },
      { text: 'MySQL', url: '/docs/database/mysql' },
      { text: 'MongoDB', url: '/docs/database/mongodb' },
      { text: 'PostgreSQL', url: '/docs/database/postgresql' },
      { text: 'RabbitMQ', url: '/docs/middleware/rabbitmq' },
    ],
  },
  {
    text: 'DevOps',
    items: [
      { text: 'CI/CD', url: '/docs/devops/cicd' },
      { text: 'Docker', url: '/docs/devops/docker' },
      { text: 'Kubernetes (k8s)', url: '/docs/devops/kubernetes' },
      { text: 'Git', url: '/docs/devops/git' },
      { text: 'Ansible', url: '/docs/devops/ansible' },
      { text: 'Terraform', url: '/docs/devops/terraform' },
    ],
  },
  {
    text: 'Middleware',
    items: [
      { text: 'Nginx', url: '/docs/middleware/nginx' },
      { text: 'Kong', url: '/docs/middleware/kong' },
      { text: 'Redis', url: '/docs/middleware/redis' },
    ],
  },
  {
    text: 'IoT',
    items: [
      { text: 'Arduino', url: '/docs/iot/arduino' },
      { text: 'STM32', url: '/docs/iot/stm32' },
    ],
  },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 font-semibold">
          <Image
            src="/img/cyd-world-clock.png"
            alt="CYD World Clock"
            width={64}
            height={32}
            className="h-8 w-16 rounded-sm object-cover"
          />
          omniscanner
        </span>
      ),
      url: '/',
    },
    links: [
      ...navigationGroups.map((group) => ({
        type: 'menu' as const,
        text: group.text,
        items: group.items.map((item) => ({ text: item.text, url: item.url })),
      })),
      { text: 'About', url: '/about', secondary: true },
    ],
    githubUrl: 'https://github.com/Compile-N-Run/Compile-N-Run',
  };
}
