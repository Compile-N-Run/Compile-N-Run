// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
        // future: {
        //     v4: true, // opt-in for Docusaurus v4 planned changes
        //     experimental_faster: true, // turns Docusaurus Faster on globally
        // },
        // ...(process.env.ENABLE_DOCUSAURUS_EXPERIMENTAL === 'true' && {
        //     future: {
        //         v4: true,
        //         experimental_faster: true,
        //     },
        // }),
        future: {
            v4: {
                removeLegacyPostBuildHeadAttribute: true, // required
            },
            experimental_faster: {
                ssgWorkerThreads: true,
            },
        },
        title: 'Compile N Run',
        tagline: 'The best website to learn any programming language for free!',
        favicon: 'favicon.ico',

        // Set the production url of your site here
        url: 'https://www.compilenrun.com', // Set the /<baseUrl>/ pathname under which your site is served
        // For GitHub pages deployment, it is often '/<projectName>/'
        baseUrl: '/',
        themes: ['@docusaurus/theme-live-codeblock', '@docusaurus/theme-mermaid', 'docusaurus-theme-search-typesense'],
        plugins: [
            [
                '@docusaurus/plugin-ideal-image',
                {
                    quality: 70,
                    max: 1030, // max resized image's size.
                    min: 640, // min resized image's size. if original is lower, use that size.
                    steps: 2, // the max number of images generated between min and max (inclusive)
                    disableInDev: false,
                },
            ],

            // [
            //     '@docusaurus/plugin-pwa',
            //     {
            //         debug: true,
            //         offlineModeActivationStrategies: [
            //             'appInstalled',
            //             'standalone',
            //             'queryString',
            //         ],
            //         pwaHead: [
            //             {
            //                 tagName: 'link',
            //                 rel: 'icon',
            //                 href: '/img/logo.png',
            //             },
            //             {
            //                 tagName: 'link',
            //                 rel: 'manifest',
            //                 href: '/manifest.json', // your PWA manifest
            //             },
            //             {
            //                 tagName: 'meta',
            //                 name: 'theme-color',
            //                 content: 'rgb(37, 194, 160)',
            //             },
            //         ],
            //     },
            // ],
        ],
        clientModules: [
            //require.resolve('./_clarity.js'),
        ],
        scripts: [
            {
                src: '/_clarity.js',
                async: true,
            },
            {
                src: "https://cloud.umami.is/script.js",
                defer: true,
                "data-website-id": "5cd1a168-25dd-480c-8560-15c0becd3768",
            },
            {
                src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8558870819217345',
                async: true,
                crossorigin: 'anonymous',
            },
        ],
        headTags: [
            {
                tagName: 'link',
                attributes: {rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96'},
            },
            {
                tagName: 'link',
                attributes: {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
            },
            {
                tagName: 'link',
                attributes: {rel: 'shortcut icon', href: '/favicon.ico'},
            },
            {
                tagName: 'link',
                attributes: {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
            },
            {
                tagName: 'link',
                attributes: {rel: 'manifest', href: '/site.webmanifest'},
            },
            // Declare a <link> preconnect tag
            // {
            //     tagName: 'link',
            //     attributes: {
            //         rel: 'preconnect',
            //         href: 'https://example.com',
            //     },
            // },
            // Declare some json-ld structured data
            {
                tagName: 'script',
                attributes: {
                    type: 'application/ld+json',
                },
                innerHTML: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    "name": 'Compile N Run',
                    "alternateName": ["Compile and Run", "Compile-N-Run"],
                    "url": 'https://www.compilenrun.com/',
                }),
            },
        ],

        markdown: {
            mermaid: true,
        },


        // GitHub pages deployment config.
        // If you aren't using GitHub pages, you don't need these.
        // organizationName: 'echo.cool', // Usually your GitHub org/user name.
        // projectName: 'docusaurus', // Usually your repo name.

        onBrokenLinks: 'warn',
        onBrokenMarkdownLinks: 'warn',

        // Even if you don't use internationalization, you can use this field to set
        // useful metadata like html lang. For example, if your site is Chinese, you
        // may want to replace "en" with "zh-Hans".
        i18n: {
            defaultLocale: 'en',
            locales: ['en'],
        },
        stylesheets: [
            {
                href: '/katex/katex.min.css',
                type: 'text/css',
            },
        ],

        presets: [
            [
                'classic',
                /** @type {import('@docusaurus/preset-classic').Options} */
                ({


                    gtag: {
                        trackingID: 'G-SG8302WY6Z',
                        anonymizeIP: false,
                    },

                    docs: {
                        sidebarPath: './sidebars.js',
                        sidebarCollapsible: true,
                        admonitions: {
                            keywords: ['code'],
                            extendDefaults: true,
                        },
                        // sidebarCollapsible: false,
                        remarkPlugins: [remarkMath],
                        rehypePlugins: [rehypeKatex],
                        // Please change this to your repo.
                        // Remove this to remove the "edit this page" links.
                        editUrl:
                          'https://github.com/Compile-N-Run/Compile-N-Run/tree/main/',
                    },
                    blog: {
                        showReadingTime: true,
                        feedOptions: {
                            type: ['rss', 'atom'],
                            xslt: true,
                        },
                        // // Please change this to your repo.
                        // // Remove this to remove the "edit this page" links.
                        // editUrl:
                        //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                        // Useful options to enforce blogging best practices
                        onInlineTags: 'warn',
                        onInlineAuthors: 'warn',
                        onUntruncatedBlogPosts: 'warn',
                    },
                    theme: {
                        customCss: './src/css/custom.css',
                    },
                    sitemap: {
                        lastmod: 'date',
                        changefreq: 'daily',
                        priority: 0.5,
                        ignorePatterns: ['/tags/**'],
                        filename: 'sitemap.xml',
                        createSitemapItems: async (params) => {
                            const {defaultCreateSitemapItems, ...rest} = params;
                            const items = await defaultCreateSitemapItems(rest);
                            return items.filter((item) => !item.url.includes('/page/'));
                        },
                    },
                }),
            ],
        ],

        themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
            ({
                // Replace with your project's social card
                image: 'img/logo.png',
                metadata: [
                    {
                        name: 'keywords',
                        content: 'learn programming, programming, python, java, javascript, c, c++, sql, go'
                    },
                    {
                        name: 'apple-mobile-web-app-title',
                        content: 'Compile N Run'
                    },
                ],
                colorMode: {
                    defaultMode: 'light',
                    disableSwitch: false,
                    respectPrefersColorScheme: true,
                },
                announcementBar: {
                    id: "replay_announcement",
                    content: 'The best website to learn any programming language and frameworks for free! Now is your turn to compile and run!',
                    backgroundColor: "#312e81",
                    textColor: "#ffffff",
                    isCloseable: true,
                },
                navbar: {
                    title: 'Compile N Run',
                    logo: {
                        alt: 'Compile and Run Logo',
                        src: 'img/logo.png',
                    },
                    hideOnScroll: false,
                    items: [
                        {
                            type: "dropdown",
                            label: "Fundamentals",
                            items: [
                                {
                                    label: 'Data Structure & Algorithm',
                                    to: "/docs/fundamental/algorithm"
                                },
                                {
                                    label: 'Computer Networks',
                                    to: "/docs/fundamental/network"
                                },
                                {
                                    label: 'Database & Information System',
                                    to: "/docs/fundamental/database"
                                },
                                {
                                    label: 'Operating System',
                                    to: "/docs/fundamental/os"
                                },
                                {
                                    label: 'Interview Preparation',
                                    to: "/docs/fundamental/interview"
                                }
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Languages",
                            items: [
                                {
                                    label: 'Python',
                                    to: "/docs/language/python"
                                },
                                {
                                    label: 'Java',
                                    to: "/docs/language/java"
                                },
                                {
                                    label: 'JavaScript',
                                    to: "/docs/language/javascript"
                                },
                                {
                                    label: 'TypeScript',
                                    to: "/docs/language/typescript"
                                },
                                {
                                    label: 'Go',
                                    to: "/docs/language/go"
                                },
                                {
                                    label: 'C#',
                                    to: "/docs/language/c-sharp"
                                },
                                {
                                    label: 'C# - .NET',
                                    to: "/docs/framework/dotnet"
                                },
                                {
                                    label: 'C',
                                    to: "/docs/language/c"
                                },
                                {
                                    label: 'C++',
                                    to: "/docs/language/cpp"
                                },
                                {
                                    label: 'Rust',
                                    to: "/docs/language/rust"
                                },
                                {
                                    label: 'SQL',
                                    to: "/docs/language/sql"
                                },

                                {
                                    label: 'PHP',
                                    to: "/docs/language/php"
                                },

                                {
                                    label: 'Kotlin',
                                    to: "/docs/language/kotlin"
                                },
                                {
                                    label: 'Swift',
                                    to: "/docs/language/swift"
                                },
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Web",
                            items: [
                                {
                                    label: 'Frontend - JavaScript',
                                    to: "/docs/language/javascript"
                                },
                                {
                                    label: 'Frontend - TypeScript',
                                    to: "/docs/language/typescript"
                                },
                                {
                                    label: 'Frontend - Angular',
                                    to: "/docs/framework/angular"
                                },
                                {
                                    label: 'Frontend - React',
                                    to: "/docs/framework/react"
                                },
                                {
                                    label: 'Frontend - Vue.js',
                                    to: "/docs/framework/vue"
                                },
                                {
                                    label: 'Backend - Django',
                                    to: "/docs/framework/django"
                                },
                                {
                                    label: 'Backend - Flask',
                                    to: "/docs/framework/flask"
                                },
                                {
                                    label: 'Backend - FastAPI',
                                    to: "/docs/framework/fastapi"
                                },
                                {
                                    label: 'Backend - Spring',
                                    to: "/docs/framework/spring"
                                },
                                {
                                    label: 'Backend - Express',
                                    to: "/docs/framework/express"
                                },
                                {
                                    label: 'Backend - Gin',
                                    to: "/docs/framework/gin"
                                },
                                {
                                    label: 'Backend - Echo',
                                    to: "/docs/framework/echo"
                                },
                                {
                                    label: 'Backend - PHP',
                                    to: "/docs/language/php"
                                },
                                {
                                    label: 'Full Stack - Next.js',
                                    to: "/docs/framework/nextjs"
                                },
                                {
                                    label: 'CMS - Wordpress',
                                    to: "/docs/framework/wordpress"
                                },

                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Observability",
                            items: [
                                // {
                                //     label: 'Alloy',
                                //     to: "/docs/observability/alloy"
                                // },
                                {
                                    label: 'Grafana',
                                    to: "/docs/observability/grafana"
                                },
                                {
                                    label: 'Prometheus',
                                    to: "/docs/observability/prometheus"
                                },
                                {
                                    label: 'Loki',
                                    to: "/docs/observability/loki"
                                },
                                // {
                                //     label: 'Jaeger',
                                //     to: "/docs/observability/jaeger"
                                // },
                                // {
                                //     label: 'OpenTelemetry',
                                //     to: "/docs/observability/opentelemetry"
                                // },
                            ],
                        },
                        {
                            type: "dropdown",
                            label: "Data & AI",
                            items: [
                                {
                                    label: 'Python',
                                    to: "/docs/language/python"
                                },
                                {
                                    label: 'Python - Pandas',
                                    to: "/docs/library/pandas"
                                },
                                {
                                    label: 'Python - PyTorch',
                                    to: "/docs/library/pytorch"
                                },
                                {
                                    label: 'Python - TensorFlow',
                                    to: "/docs/library/tensorflow"
                                }

                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Mobile",
                            items: [
                                {
                                    label: 'Android - Java',
                                    to: "/docs/language/java"
                                },
                                {
                                    label: 'Android - Kotlin',
                                    to: "/docs/language/kotlin"
                                },
                                {
                                    label: 'iOS - Swift',
                                    to: "/docs/language/swift"
                                },
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Linux",
                            items: [
                                {
                                    label: 'C',
                                    to: "/docs/language/c"
                                },
                                {
                                    label: 'C++',
                                    to: "/docs/language/cpp"
                                },
                                {
                                    label: 'Rust',
                                    to: "/docs/language/rust"
                                },
                                {
                                    label: 'Ubuntu',
                                    to: "/docs/os/ubuntu"
                                },
                                {
                                    label: 'Debian',
                                    to: "/docs/os/debian"
                                }
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Databases",
                            items: [
                                {
                                    label: 'Redis',
                                    to: "/docs/middleware/redis"
                                },
                                // {
                                //     label: 'SQL',
                                //     to: "/docs/language/sql"
                                // },

                                {
                                    label: 'MySQL',
                                    to: "/docs/database/mysql"
                                },
                                {
                                    label: 'MongoDB',
                                    to: "/docs/database/mongodb"
                                },
                                {
                                    label: 'PostgreSQL',
                                    to: "/docs/database/postgresql"
                                },
                                {
                                    label: 'RabbitMQ',
                                    to: "/docs/middleware/rabbitmq"
                                },

                            ]
                        },
                        {
                            type: "dropdown",
                            label: "DevOps",
                            items: [
                                {
                                    label: "CI/CD",
                                    to: "/docs/devops/cicd"
                                },
                                {
                                    label: 'Docker',
                                    to: "/docs/devops/docker"
                                },
                                {
                                    label: 'Kubernetes (k8s)',
                                    to: "/docs/devops/kubernetes"
                                },
                                {
                                    label: 'Git',
                                    to: "/docs/devops/git"
                                },
                                {
                                    label: 'Ansible',
                                    to: "/docs/devops/ansible"
                                },
                                {
                                    label: 'Terraform',
                                    to: "/docs/devops/terraform"
                                }
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "Middleware",
                            items: [
                                {
                                    label: 'Nginx',
                                    to: "/docs/middleware/nginx"
                                },
                                {
                                    label: 'Kong',
                                    to: "/docs/middleware/kong"
                                },
                                {
                                    label: 'Redis',
                                    to: "/docs/middleware/redis"
                                },
                            ]
                        },
                        {
                            type: "dropdown",
                            label: "IoT",
                            items: [
                                {
                                    label: 'Arduino',
                                    to: "/docs/iot/arduino"
                                },
                                {
                                    label: 'STM32',
                                    to: "/docs/iot/stm32"
                                },
                            ]
                        },

                        // {
                        //     position: 'left',
                        //     label: 'Algorithm',
                        //     to: "/docs/algorithm"
                        // }
                    ],
                },
                footer: {
                    style: 'dark',
                    links: [
                        {
                            title: 'Compile N Run',
                            items: [
                                {
                                    label: 'Home',
                                    to: '/',
                                },
                                {
                                    label: 'Search',
                                    to: '/search',
                                },
                                {
                                    label: 'Feedback',
                                    to: 'mailto:feedback@compilenrun.com',
                                }
                            ],
                        },
                        {
                            title: 'Links',
                            items: [
                                {
                                    label: 'About me',
                                    to: 'https://www.yuyangwang.org/',
                                },
                                {
                                    label: 'CN Site',
                                    to: 'https://www.echo.cool/',
                                },
                                {
                                    label: 'Github',
                                    to: 'https://github.com/Compile-N-Run/Compile-N-Run',
                                },
                            ],
                        },
                        {
                            title: 'Tools',
                            items: [
                                {
                                    label: 'Emoji to PNG',
                                    to: 'https://emoji.compilenrun.com/',
                                },
                                {
                                    label: 'Image Resizer',
                                    to: 'https://resizer.compilenrun.com/',
                                },
                                {
                                    label: 'SVG Viewer',
                                    to: 'https://svgviewer.compilenrun.com/',
                                },
                            ],
                        }


                        //   {
                        //     title: 'Community',
                        //     items: [
                        //       {
                        //         label: 'Stack Overflow',
                        //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                        //       },
                        //       {
                        //         label: 'Discord',
                        //         href: 'https://discordapp.com/invite/docusaurus',
                        //       },
                        //       {
                        //         label: 'X',
                        //         href: 'https://x.com/docusaurus',
                        //       },
                        //     ],
                        //   },
                        //   {
                        //     title: 'More',
                        //     items: [
                        //       {
                        //         label: 'Blog',
                        //         to: '/blog',
                        //       },
                        //       {
                        //         label: 'GitHub',
                        //         href: 'https://github.com/facebook/docusaurus',
                        //       },
                        //     ],
                        //   },
                    ],
                    copyright: `Copyright © ${new Date().getFullYear()} Compile N Run.`,
                },
                prism: {
                    theme: prismThemes.github,
                    darkTheme: prismThemes.dracula,
                    additionalLanguages: ['powershell', 'bash', 'java', "php", "csharp", "c", "cpp", "go", "kotlin", "swift", "rust", "sql", "yaml", "markdown", "json", "lua"],
                    magicComments: [
                        // Remember to extend the default highlight class name as well!
                        {
                            className: 'theme-code-block-highlighted-line',
                            line: 'highlight-next-line',
                            block: {start: 'highlight-start', end: 'highlight-end'},
                        },
                        {
                            className: 'code-block-error-line',
                            line: 'error-line',
                        },
                    ],
                },
                typesense: {
                    // Replace this with the name of your index/collection.
                    // It should match the "index_name" entry in the scraper's "config.json" file.
                    typesenseCollectionName: 'compile-n-run-docusaurus',

                    typesenseServerConfig: {
                        nodes: [
                            {
                                host: 'search.api.compilenrun.com',
                                port: 443,
                                protocol: 'https',
                            }
                        ],
                        apiKey: 'hjfkh314jh5hk1j3lh45k3jh254',
                    },

                    // Optional: Typesense search parameters: https://typesense.org/docs/0.24.0/api/search.html#search-parameters
                    typesenseSearchParameters: {},

                    // Optional
                    contextualSearch: true,
                },

                // algolia: {
                //     // The application ID provided by Algolia
                //     appId: 'FJ7DVP2YUA',
                //
                //     // Public API key: it is safe to commit it
                //     apiKey: '4d423c293ccaa886e9a9d83e29c301d3',
                //
                //     indexName: 'compilenrun',
                //
                //     // Optional: see doc section below
                //     contextualSearch: true,
                //
                //     // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
                //     // externalUrlRegex: 'external\\.com|domain\\.com',
                //
                //     // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
                //     // replaceSearchResultPathname: {
                //     //     from: '/docs/', // or as RegExp: /\/docs\//
                //     //     to: '/',
                //     // },
                //
                //     // Optional: Algolia search parameters
                //     // searchParameters: {},
                //
                //     // Optional: path for search page that enabled by default (`false` to disable it)
                //     searchPagePath: 'search',
                //
                //     // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
                //     insights: true,
                //
                //     //... other Algolia params
                // },

            }),
    }
;

export default config;
