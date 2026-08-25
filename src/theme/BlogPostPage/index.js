import React from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function BlogPostPageWrapper(props) {
    const { siteConfig } = useDocusaurusContext();

    /** @type {import('@docusaurus/plugin-content-blog').BlogPostMetadata} */ const blogMetaData =
        props.content.metadata;

    // https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#json-ld
    const archiveBreadcrumbStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        name: 'Archive breadcrumb',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Archive',
                item: `${siteConfig.url}/archive`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: blogMetaData.title,
            },
        ],
    };

    const tagsBreadcrumbStructuredData = blogMetaData.tags.map((tag) => ({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        name: `Tags ${tag.label} breadcrumb`,
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteConfig.url,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Tags',
                item: `${siteConfig.url}/tags`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: tag.label,
                item: `${siteConfig.url}${tag.permalink}`,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: blogMetaData.title,
            },
        ],
    }));

    const breadcrumbStructuredData = [
        archiveBreadcrumbStructuredData,
        ...tagsBreadcrumbStructuredData,
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData),
                }}
            />
            <BlogPostPage {...props} />
        </>
    );
}