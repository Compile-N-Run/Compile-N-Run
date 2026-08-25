import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link'; // Import Link for navigation
import styles from './styles.module.css';
import Image from '@theme/IdealImage';
import Head from '@docusaurus/Head';

import pythonLogoUrl from '@site/static/img/language-logo/python-logo-only.png';
import javaLogoUrl from '@site/static/img/language-logo/java-logo.png';
import javaScriptLogoUrl from '@site/static/img/language-logo/javascript-logo.png';
import cLogo from '@site/static/img/language-logo/c_logo.png';
import cppLogo from '@site/static/img/language-logo/cpp_logo.png';
import goLogo from '@site/static/img/language-logo/go_logo.png';
import rustLogo from '@site/static/img/language-logo/rust_logo.png';
import sqlLogo from '@site/static/img/language-logo/sql_logo.png';
import phpLogo from '@site/static/img/language-logo/php_logo.png';
import cSharpLogo from '@site/static/img/language-logo/csharp_logo.png';
import kotlinLogo from '@site/static/img/language-logo/kotlin_logo.png';
import swiftLogo from '@site/static/img/language-logo/swift_logo.png';
import angularLogo from '@site/static/img/framework-logo/angular_logo.png';
import djangoLogo from '@site/static/img/framework-logo/django_logo.png';
import dotnetLogo from '@site/static/img/framework-logo/dotnet_logo.png';
import echoLogo from '@site/static/img/framework-logo/echo_logo.png';
import expressLogo from '@site/static/img/framework-logo/express_logo.png';
import fastapiLogo from '@site/static/img/framework-logo/fastapi_logo.png';
import flaskLogo from '@site/static/img/framework-logo/flask_logo.png';
import ginLogo from '@site/static/img/framework-logo/gin_logo.png';
import nextjsLogo from '@site/static/img/framework-logo/nextjs_logo.png';
import springLogo from '@site/static/img/framework-logo/spring_logo.png';
import pandasLogo from '@site/static/img/library-logo/pandas_logo.png';
import pytorchLogo from '@site/static/img/library-logo/pytorch_logo.png';
import tensorflowLogo from '@site/static/img/library-logo/tensorflow_logo.png';
import reactLogo from '@site/static/img/framework-logo/react_logo.png';
import vueLogo from '@site/static/img/framework-logo/vue_logo.png';
import wordpressLogo from '@site/static/img/framework-logo/wordpress_logo.png';
import kongLogo from '@site/static/img/middleware-logo/kong_logo.png';
import redisLogo from '@site/static/img/middleware-logo/redis_logo.png';
import typeScriptLogo from '@site/static/img/language-logo/typescript_logo.png';
import mysqlLogo from '@site/static/img/database-logo/mysql_logo.png';
import postgresqlLogo from '@site/static/img/database-logo/postgresql_logo.png';
import mongodbLogo from '@site/static/img/database-logo/mongodb_logo.png';
import kubernetesLogo from '@site/static/img/devops-logo/kubernetes_logo.png';
import cicdLogo from '@site/static/img/devops-logo/cicd_logo.png';
import arduinoLogo from '@site/static/img/iot-logo/arduino_logo.png';
import dockerLogo from '@site/static/img/devops-logo/docker_logo.png';
import ubuntuLogo from '@site/static/img/os-logo/ubuntu_logo.png';
import debianLogo from '@site/static/img/os-logo/debian_logo.png';
import gitLogo from '@site/static/img/devops-logo/git_logo.png';
import nginxLogo from '@site/static/img/middleware-logo/nginx_logo.png';
import ansibleLogo from '@site/static/img/devops-logo/ansible_logo.png';
import dsaLogo from '@site/static/img/fundamentals-logo/dsa_logo.png';
import networkLogo from '@site/static/img/fundamentals-logo/network_logo.png';
import interviewLogo from '@site/static/img/fundamentals-logo/interview_logo.png';

import springcloudLogo from '@site/static/img/framework-logo/spring_cloud_logo.png';
import dbaLogo from '@site/static/img/fundamentals-logo/database_logo.png';
import stm32Logo from '@site/static/img/iot-logo/stm32_logo.png';
import iot51Logo from '@site/static/img/iot-logo/51_logo.png';
import htmlLogo from '@site/static/img/web-logo/html_logo.png';
import osLogo from '@site/static/img/fundamentals-logo/os_logo.png';
import rabbitmqLogo from '@site/static/img/middleware-logo/rabbitmq_logo.png';
import zookeeperLogo from '@site/static/img/middleware-logo/zookeeper_logo.png';
import wechatminiprogramLogo from '@site/static/img/framework-logo/wechatminiprogram_logo.png';
import androidLogo from '@site/static/img/framework-logo/android_logo.png';
import leanLogo from '@site/static/img/fundamentals-logo/lean_logo.png';
import cassandraLogo from '@site/static/img/database-logo/cassandra_logo.png';
import hbaseLogo from '@site/static/img/database-logo/hbase_logo.png';
import hiveLogo from '@site/static/img/database-logo/hive_logo.png';
import airflowLogo from '@site/static/img/data-logo/airflow_logo.png';
import rLogo from '@site/static/img/data-logo/r_logo.png';
import drillLogo from '@site/static/img/data-logo/drill_logo.png';
import hadoopLogo from '@site/static/img/data-logo/hadoop_logo.png';
import sparkLogo from '@site/static/img/data-logo/spark_logo.png';

import alloyLogo from '@site/static/img/observability-logo/alloy_logo.png';
import grafanaLogo from '@site/static/img/observability-logo/grafana_logo.png';
import lokiLogo from '@site/static/img/observability-logo/loki_logo.png';
import prometheusLogo from '@site/static/img/observability-logo/prometheus_logo.png';
import terraformLogo from '@site/static/img/devops-logo/terraform_logo.png';

const programmingLanguagesList = [
    {
        title: 'Python',
        Icon: (alt) => {
            return <Image img={pythonLogoUrl} className={styles.featureImage} alt={alt.alt}/>;
        }, url: "/docs/language/python",
        description: <>Python 3 is a high-level, interpreted, and general-purpose programming language.</>,
    }, {
        title: 'Java',
        Icon: (alt) => {
            return <Image img={javaLogoUrl} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/java",
        description: <>Java is a object-oriented programming language designed to be platform-independent.</>,
    }, {
        title: 'JavaScript',
        Icon: (alt) => {
            return <Image img={javaScriptLogoUrl} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/javascript",
        description: <>JavaScript is a client-side scripting language that enables interactive functionality on
            websites.</>,
    },
    {
        title: 'TypeScript',
        Icon: (alt) => {
            return <Image img={typeScriptLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/typescript",
        description: <>TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.</>,
    },
    {
        title: 'C',
        Icon: (alt) => {
            return <Image img={cLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/c",
        description: <>C is a general-purpose programming language that is widely used for system and application
            development.</>,
    },
    {
        title: 'C++',
        Icon: (alt) => {
            return <Image img={cppLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/cpp",
        description: <>C++ is a powerful, high-performance programming language that extends C with object-oriented
            capabilities.</>,
    },
    // {
    //     title: 'SQL',
    //     Icon: (alt) => {
    //         return <Image img={javaLogoUrl} className={styles.featureImage}/>;
    //     },
    //     url: "/docs/language/sql/",
    //     description: <>SQL is a domain-specific language used in programming and managing relational databases.</>,
    // },
    {
        title: 'Go',
        Icon: (alt) => {
            return <Image img={goLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/go",
        description: <>Go is a statically typed, compiled programming language designed for simplicity and
            efficiency.</>,
    },
    {
        title: 'Rust',
        Icon: (alt) => {
            return <Image img={rustLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/rust",
        description: <>Rust is a systems programming language focused on safety, speed, and concurrency.</>,
    },
    {
        title: 'SQL',
        Icon: (alt) => {
            return <Image img={sqlLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/sql",
        description: <>SQL is a domain-specific language used in programming and managing relational databases.</>,
    },
    {
        title: "PHP",
        Icon: (alt) => {
            return <Image img={phpLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/php",
        description: <>The "best" language in the world.</>,
    },
    {
        title: 'C#',
        Icon: (alt) => {
            return <Image img={cSharpLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/c-sharp",
        description: <>C# is a modern, object-oriented programming language developed by Microsoft.</>,
    },
    {
        title: 'Kotlin',
        Icon: (alt) => {
            return <Image img={kotlinLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/kotlin",
        description: <>Kotlin is a modern, statically typed programming language that runs on the Java Virtual Machine
            (JVM).</>,
    },
    {
        title: "Swift",
        Icon: (alt) => {
            return <Image img={swiftLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/language/swift",
        description: <>Swift is a powerful and intuitive programming language for iOS, macOS, watchOS, and tvOS app
            development.</>,
    }
];


const fundamentalsList = [
    {
        title: 'Interview Preparation',
        Icon: () => {
            return <Image img={interviewLogo} className={styles.featureImage}/>;
        },
        url: "/docs/fundamental/interview",
        description: <>Interview Preparation is essential to land a job in the tech industry. It includes coding
            questions, system design, and behavioral questions.</>,
    },
    {
        title: 'Data Stucture & Algorithm',
        Icon: () => {
            return <Image img={dsaLogo} className={styles.featureImage}/>;
        },
        url: "/docs/fundamental/algorithm",
        description: <>Data Structure & Algorithm is the foundation of computer science. It is essential for software
            development and problem-solving.</>,
    },
    {
        title: 'Computer Network',
        Icon: () => {
            return <Image img={networkLogo} className={styles.featureImage}/>;
        },
        url: "/docs/fundamental/network",
        description: <>Computer Network is a set of computers connected to share resources and information.</>,
    },
    {
        title: 'Database & Information System',
        Icon: () => {
            return <Image img={dbaLogo} className={styles.featureImage}/>;
        },
        url: "/docs/fundamental/database",
        description: <>Database & Information System is a collection of data and a set of programs to access and manage
            that data.</>,
    },
    {
        title: 'Operating System',
        Icon: () => {
            return <Image img={osLogo} className={styles.featureImage}/>;
        },
        url: "/docs/fundamental/os",
        description: <>Operating System is system software that manages computer hardware, software resources, and
            provides common services for computer programs.</>,
    },

];

const frameworkList = [
    {
        title: "Spring",
        Icon: (alt) => {
            return <Image img={springLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/spring",
        description: <>Spring is a powerful, feature-rich, and flexible framework for Java.</>,
    },
    {
        title: "Django",
        Icon: (alt) => {
            return <Image img={djangoLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/django",
        description: <>Django is a high-level Python web framework that encourages rapid development and clean,
            pragmatic design.</>,
    },
    {
        title: "FastAPI",
        Icon: (alt) => {
            return <Image img={fastapiLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/fastapi",
        description: <>FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.6+
            based on standard Python type hints.</>,
    },
    {
        title: "Flask",
        Icon: (alt) => {
            return <Image img={flaskLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/flask",
        description: <>Flask is a lightweight WSGI web application framework.</>,
    },
    {
        title: "Gin",
        Icon: (alt) => {
            return <Image img={ginLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/gin",
        description: <>Gin is a web framework written in Go (Golang).</>,
    },
    {
        title: "Echo",
        Icon: (alt) => {
            return <Image img={echoLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/echo",
        description: <>Echo is a high performance, extensible, minimalist web framework for Go.</>,
    },

    {
        title: "Next.js",
        Icon: (alt) => {
            return <Image img={nextjsLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/nextjs",
        description: <>Next.js is a React framework that enables functionality such as server-side rendering and
            generating static websites for React based web applications.</>,
    },
    {
        title: "Angular",
        Icon: (alt) => {
            return <Image img={angularLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/angular",
        description: <>Angular is a platform and framework for building single-page client applications using HTML and
            TypeScript.</>,
    },
    {
        title: "Express",
        Icon: (alt) => {
            return <Image img={expressLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/express",
        description: <>Express is a fast, unopinionated, minimalist web framework for Node.js.</>,
    },
    {
        title: "React",
        Icon: (alt) => {
            return <Image img={reactLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/react",
        description: <>React is a JavaScript library for building user interfaces.</>,
    },
    {
        title: "Vue.js",
        Icon: (alt) => {
            return <Image img={vueLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/vue",
        description: <>Vue.js is a progressive JavaScript framework used to build interactive web interfaces.</>,
    },

    {
        title: ".NET",
        Icon: (alt) => {
            return <Image img={dotnetLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/dotnet",
        description: <>.NET is a free, cross-platform, open-source developer platform for building many different types
            of
            applications.</>,
    },
    {
        title: "WordPress",
        Icon: (alt) => {
            return <Image img={wordpressLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/framework/wordpress",
        description: <>WordPress is a free and open-source content management system (CMS) based on PHP and MySQL.</>,
    },

];


const observabilityList = [
    // {
    //     title: "Alloy",
    //     Icon: (alt) => {
    //         return <Image img={alloyLogo} className={styles.featureImage} alt={alt.alt}/>;
    //     },
    //     url: "/docs/observability/alloy",
    //     description: <>Alloy is a lightweight, open-source observability platform that provides logging, metrics, and
    //         tracing capabilities.</>,
    // },
    {
        title: "Grafana",
        Icon: (alt) => {
            return <Image img={grafanaLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/observability/grafana",
        description: <>Grafana is an open-source platform for monitoring and observability. It provides beautiful
            visualizations for time series data.</>,
    },
    {
        title: "Prometheus",
        Icon: (alt) => {
            return <Image img={prometheusLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/observability/prometheus",
        description: <>Prometheus is an open-source monitoring and alerting toolkit. It is designed for reliability and
            scalability.</>,
    },
    {
        title: "Loki",
        Icon: (alt) => {
            return <Image img={lokiLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/observability/loki",
        description: <>Loki is a log aggregation system designed for efficiency and scalability. It is inspired by Prometheus
            and is optimized for fast, cost-effective log management.</>,
    },
    // {
    //     title: "Jaeger",
    //     Icon: (alt) => {
    //         return <Image img={jaegerLogo} className={styles.featureImage} alt={alt.alt}/>;
    //     },
    //     url: "/docs/observability/jaeger",
    //     description: <>Jaeger is an open-source, end-to-end distributed tracing system. It helps in monitoring and
    //         troubleshooting complex microservices architectures.</>,
    // },
    // {
    //     title: "OpenTelemetry",
    //     Icon: (alt) => {
    //         return <Image img={opentelemetryLogo} className={styles.featureImage} alt={alt.alt}/>;
    //     },
    //     url: "/docs/observability/opentelemetry",
    //     description: <>OpenTelemetry is a set of APIs, libraries, agents, and instrumentation to provide observability
    //         for applications. It is a vendor-neutral standard for collecting telemetry data.</>,
    // },
]


const libraryList = [
    {
        title: "Pandas",
        Icon: (alt) => {
            return <Image img={pandasLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/library/pandas",
        description: <>Pandas is a fast, powerful, flexible, and easy-to-use open-source data analysis and data
            manipulation library built on top of the Python programming language.</>,
    },
    {
        title: "PyTorch",
        Icon: (alt) => {
            return <Image img={pytorchLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/library/pytorch",
        description: <>PyTorch is an open-source machine learning library developed by Facebook's AI Research lab.</>,
    },
    {
        title: "TensorFlow",
        Icon: (alt) => {
            return <Image img={tensorflowLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/library/tensorflow",
        description: <>TensorFlow is an open-source machine learning library developed by Google.</>,
    },
];

const middlewareList = [
    {
        title: "Nginx",
        Icon: (alt) => {
            return <Image img={nginxLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/middleware/nginx",
        description: <>Nginx is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and
            HTTP cache.</>,
    },
    {
        title: "Kong",
        Icon: (alt) => {
            return <Image img={kongLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/middleware/kong",
        description: <>Kong is a cloud-native, fast, scalable, and distributed Microservice Abstraction Layer (also
            known
            as an API Gateway or API Middleware).</>,
    },
    {
        title: "Redis",
        Icon: (alt) => {
            return <Image img={redisLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/middleware/redis",
        description: <>Redis is an open-source, in-memory data structure store, used as a database, cache, and message
            broker.</>,
    },
    {
        title: "RabbitMQ",
        Icon: (alt) => {
            return <Image img={rabbitmqLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/middleware/rabbitmq",
        description: <>RabbitMQ is an open-source message-broker software that originally implemented the Advanced
            Message Queuing Protocol (AMQP).</>,
    },
];

const databaseList = [
    // {
    //     title: "Redis",
    //     Icon: (alt) => {
    //         return <Image img={redisLogo} className={styles.featureImage} alt={alt.alt}/>;
    //     },
    //     url: "/docs/middleware/redis",
    //     description: <>Redis is an open-source, in-memory data structure store, used as a database, cache, and message
    //         broker.</>,
    // },
    {
        title: "MySQL",
        Icon: (alt) => {
            return <Image img={mysqlLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/database/mysql",
        description: <>MySQL is an open-source relational database management system.</>,
    },
    {
        title: "MongoDB",
        Icon: (alt) => {
            return <Image img={mongodbLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/database/mongodb",
        description: <>MongoDB is a cross-platform document-oriented database program.</>,
    },

    {
        title: "PostgreSQL",
        Icon: (alt) => {
            return <Image img={postgresqlLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/database/postgresql",
        description: <>PostgreSQL is an open-source relational database management system.</>,
    }
];

const devopsList = [
    {
        title: "CI/CD",
        Icon: (alt) => {
            return <Image img={cicdLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/cicd",
        description: <>CI/CD is a method to frequently deliver apps to customers by introducing automation into the
            stages of app development.</>,
    },
    {
        title: "Docker",
        Icon: (alt) => {
            return <Image img={dockerLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/docker",
        description: <>Docker is a set of platform as a service products that use OS-level virtualization to deliver
            software in packages called containers.</>,
    },
    {
        title: "Kubernetes (k8s)",
        Icon: (alt) => {
            return <Image img={kubernetesLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/kubernetes",
        description: <>Kubernetes is an open-source container-orchestration system for automating computer application
            deployment, scaling, and management.</>,
    },
    {
        title: "Git",
        Icon: (alt) => {
            return <Image img={gitLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/git",
        description: <>Git is a distributed version-control system for tracking changes in source code during software
            development.</>,
    },
    {
        title: "Ansible",
        Icon: (alt) => {
            return <Image img={ansibleLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/ansible",
        description: <>Ansible is an open-source software provisioning, configuration management, and
            application-deployment
            tool.</>,
    },
    {
        title: "Terraform",
        Icon: (alt) => {
            return <Image img={terraformLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/devops/terraform",
        description: <>Terraform is an open-source infrastructure as code software tool created by HashiCorp.</>,
    },
]

const osList = [
    {
        title: "Ubuntu",
        Icon: (alt) => {
            return <Image img={ubuntuLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/os/ubuntu",
        description: <>Ubuntu is a Linux distribution based on Debian and composed mostly of free and open-source
            software.</>,
    },
    {
        title: "Debian",
        Icon: (alt) => {
            return <Image img={debianLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/os/debian",
        description: <>Debian is a Unix-like operating system consisting entirely of free software.</>,
    }
]

const iotList = [
    {
        title: "Arduino",
        Icon: (alt) => {
            return <Image img={arduinoLogo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/iot/arduino",
        description: <>Arduino is an open-source electronics platform based on easy-to-use hardware and software.</>,
    },
    {
        title: "STM32",
        Icon: (alt) => {
            return <Image img={stm32Logo} className={styles.featureImage} alt={alt.alt}/>;
        },
        url: "/docs/iot/stm32",
        description: <>STM32 is a family of 32-bit microcontroller integrated circuits by STMicroelectronics.</>,
    }
];


function IndexPageItem({Icon, title, description, url}) {
    return (
        <div className={clsx('col col--3')} style={{marginBottom: "1rem", marginTop: "1rem"}}>
            <Link to={url} className={styles.cardLink} style={{textDecoration: 'none'}}>
                <div className={clsx('card', styles.featureCard)}>
                    <div className={styles.icon_image}>
                        <Icon alt={title}/>
                    </div>
                    <div>
                        <div className="card__body text--center padding-horiz--md">
                            <Heading as="h3" className="index_page_item_title">{title}</Heading>
                            <p>{description}</p>
                        </div>
                        <div className="card__footer text--center">
                            <div className="button button--primary">
                                Read More
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function HomepageFeatures() {
    // // Define structured data
    // const combinedList = [
    //     ...programmingLanguagesList,
    //     ...frameworkList,
    //     ...libraryList,
    //     ...middlewareList,
    //     ...databaseList,
    //     ...devopsList,
    //     ...iotList
    // ];
    //
    // const structuredData = {
    //     "@context": "https://schema.org",
    //     "@type": "ItemList",
    //     "name": "Programming Languages, Frameworks, Libraries, Middleware",
    //     "description": "A collection of programming languages, frameworks, libraries, and middleware with descriptions and learning resources.",
    //     "itemListElement": combinedList.map((item, index) => ({
    //         "@type": "ListItem",
    //         "position": index + 1,
    //         "name": item.title,
    //         "url": `https://www.compilenrun.com${item.url}`,
    //         "description": item.description.props.children
    //     }))
    // };

    return (
        <section className={styles.features}>
            {/* Add the structured data component */}
            {/*<Head>*/}
            {/*    <script type="application/ld+json">*/}
            {/*        {JSON.stringify(structuredData)}*/}
            {/*    </script>*/}
            {/*</Head>*/}
            <div className="container">
                {/* Fundamentals Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>CS Fundamentals</h2>
                </div>
                <div className="row">
                    {fundamentalsList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>

                {/* Programming Languages Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Programming Languages</h2>
                </div>
                <div className="row">
                    {programmingLanguagesList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>

                {/* Frameworks Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Frameworks</h2>
                </div>
                <div className="row">
                    {frameworkList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* Observability Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Observability</h2>
                </div>
                <div className="row">
                    {observabilityList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* Library Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Libraries</h2>
                </div>
                <div className="row">
                    {libraryList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* Middleware Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Middleware</h2>
                </div>
                <div className="row">
                    {middlewareList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* Database Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Databases</h2>
                </div>
                <div className="row">
                    {databaseList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* DevOps Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>DevOps</h2>
                </div>
                <div className="row">
                    {devopsList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* Operating Systems Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Operating Systems</h2>
                </div>
                <div className="row">
                    {osList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
                {/* IoT Section */}
                <div style={{marginTop: "2rem"}}>
                    <h2>Internet of Things (IoT)</h2>
                </div>
                <div className="row">
                    {iotList.map((props, idx) => (
                        <IndexPageItem key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}