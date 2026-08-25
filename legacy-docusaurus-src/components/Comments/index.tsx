import {JSX} from "react";
import Giscus from "@giscus/react";
import {useColorMode} from "@docusaurus/theme-common";

export default function Comments(): JSX.Element {
    const {colorMode} = useColorMode();

    return (
        <div>
            <Giscus
                id="comments"
                repo="Compile-N-Run/Compile-N-Run"
                repoId="R_kgDOOAqVEQ"
                category="General"
                categoryId="DIC_kwDOOAqVEc4CnZ-y"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={colorMode === "dark" ? "dark_tritanopia" : "light_tritanopia"}
                lang="en"
                loading="lazy"
            />
        </div>
    );
}