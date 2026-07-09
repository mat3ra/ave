import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import React from "react";
import _ from "underscore";

// TODO: make this component self-confined and manage it through Tracker
class UnitOutput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollDisabled: false,
            skip: 0,
            scrollTop: 0, // eslint-disable-line react/no-unused-state
            limit: 100,
        };

        this.onScroll = this.onScroll.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        const { onOutputUpdateRequest, unit } = this.props;
        const { skip, limit } = this.state;

        onOutputUpdateRequest(unit.flowchartId, skip, limit);
    }

    componentDidUpdate() {
        const { scrollDisabled } = this.state;

        if (!scrollDisabled) {
            this.scrollToBottom();
        }
    }

    onScroll() {
        const me = this;
        // This is margin of 'pre' DOM element, where the text is shown.
        const margin = 30;

        if (me.timeOut) {
            clearTimeout(me.timeOut);
        }

        const currentScrollTop = me.outputEl.scrollTop;
        const previousScrollTop = me.state.scrollTop || 0;
        const { scrollHeight } = me.outputEl;

        // Disable if scroll up
        if (previousScrollTop > currentScrollTop) {
            me.setState({ scrollDisabled: true });
        }

        if (scrollHeight - currentScrollTop - me.outputEl.offsetHeight - margin < 10) {
            me.setState({ scrollDisabled: false });
        }

        // Remember current scroll position
        me.setState({ scrollTop: currentScrollTop });

        me.timeOut = setTimeout(() => {
            if (previousScrollTop < currentScrollTop) {
                // If we reach the bottom, we need to load more chunks
                if (scrollHeight - currentScrollTop - me.outputEl.offsetHeight - margin < 10) {
                    me.setState({
                        limit: me.state.limit + 100,
                        scrollDisabled: false,
                    });
                    me.props.onOutputUpdateRequest(
                        me.props.unit.flowchartId,
                        me.state.skip,
                        me.state.limit,
                    );
                }
            }
        }, 100); // Threshold to prevent multiple calls on small scroll
    }

    scrollToTop() {
        this.outputEl.scrollTo({ top: 0 });
        this.setState({ scrollDisabled: true });
    }

    scrollToBottom() {
        this.outputEl.scrollTo({ top: this.outputEl.scrollHeight });
    }

    render() {
        const { unit, output } = this.props;

        return (
            <Stack overflow="hidden" className="UnitOutput" position="relative">
                {/* Scroll up/down triggers */}
                <ButtonGroup
                    className="btn-group"
                    role="group"
                    sx={{
                        position: "absolute",
                        background: "#f5f5f5", // to match pre below,
                        right: 0,
                        top: 0,
                        my: 1,
                        mx: 2,
                    }}>
                    <Button
                        className="btn btn-outline"
                        onClick={this.scrollToTop}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconByName name="shapes.arrow.upAlt" />
                    </Button>
                    <Button
                        className="btn btn-outline"
                        onClick={this.scrollToBottom}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconByName name="shapes.arrow.downAlt" />
                    </Button>
                </ButtonGroup>
                <Box
                    overflow="auto"
                    ref={(e) => {
                        this.outputEl = e;
                    }}>
                    <pre
                        className="unit-output"
                        id={`${unit.flowchartId}-output`}
                        onScroll={_.debounce(this.onScroll, 100)}>
                        {output}
                    </pre>
                </Box>
            </Stack>
        );
    }
}

UnitOutput.propTypes = {
    unit: PropTypes.object.isRequired,
    output: PropTypes.string.isRequired,
    onOutputUpdateRequest: PropTypes.func,
};

UnitOutput.defaultProps = {
    onOutputUpdateRequest: () => {},
};

export { UnitOutput };
