import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import Head from "@docusaurus/Head";

export function PageMetaDataWithoutSiteName({ title, description, keywords, image, children, }) {
    const pageTitle = title;
    const { withBaseUrl } = useBaseUrlUtils();
    const pageImage = image ? withBaseUrl(image, { absolute: true }) : undefined;

    // Generate JSON-LD data from the provided metadata
    const generateJsonLd = () => {
        // Base structure with required fields
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "WebPage",
        };

        // Add available metadata
        if (title) jsonLd.name = title;
        if (description) jsonLd.description = description;
        if (pageImage) jsonLd.image = pageImage;

        // Add keywords if available
        if (keywords) {
            jsonLd.keywords = Array.isArray(keywords) ? keywords.join(',') : keywords;
        }

        return jsonLd;
    };

    const jsonLdString = generateJsonLd();

    return (<Head>
        {title && <title>{pageTitle}</title>}
        {title && <meta property="og:title" content={pageTitle}/>}

        {description && <meta name="description" content={description}/>}
        {description && <meta property="og:description" content={description}/>}

        {keywords && (<meta name="keywords" content={
            // https://github.com/microsoft/TypeScript/issues/17002
            (Array.isArray(keywords) ? keywords.join(',') : keywords)}/>)}

        {pageImage && <meta property="og:image" content={pageImage}/>}
        {pageImage && <meta name="twitter:image" content={pageImage}/>}

        {/* Add the JSON-LD script tag with automatically generated data */}
        <script type="application/ld+json">
            {JSON.stringify(jsonLdString)}
        </script>

        {children}
    </Head>);
}