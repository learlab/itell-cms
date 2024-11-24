import katex from 'katex';
import "./katex.css";

export function katexRender(
    equation,
    element,
    display,
    katexRenderOptions,
) {

    katex.render(equation, element, {
        throwOnError: false,
        displayMode: display,
        ...katexRenderOptions
    });

}
