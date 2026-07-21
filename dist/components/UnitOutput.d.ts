export class UnitOutput extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        scrollDisabled: boolean;
        skip: number;
        scrollTop: number;
        limit: number;
    };
    onScroll(): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    componentDidMount(): void;
    componentDidUpdate(): void;
    timeOut: number | undefined;
    render(): React.JSX.Element;
    outputEl: unknown;
}
export namespace UnitOutput {
    namespace propTypes {
        let unit: PropTypes.Validator<object>;
        let output: PropTypes.Validator<string>;
        let onOutputUpdateRequest: PropTypes.Requireable<(...args: any[]) => any>;
    }
    namespace defaultProps {
        export function onOutputUpdateRequest_1(): void;
        export { onOutputUpdateRequest_1 as onOutputUpdateRequest };
    }
}
import React from "react";
import PropTypes from "prop-types";
