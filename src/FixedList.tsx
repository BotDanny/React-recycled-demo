import React, { Component } from 'react'

interface props {
    height: number;
    data: any[];
    rowHeight: number;
    rowHeights?: number[];
    column?: number;
    rowColumns?: number[];
}

interface state {
    renderedRowAbsoluteIndex: number[];
    topRenderedRowRelativeIndex: number;
    loadingState: boolean[];
}

export default class FixedList extends React.PureComponent<props, state> {
    rowPositions: number[];
    rowToDataIndexMap: {[key: string]: [number, number]};


    constructor(props: props) {
        super(props);

    }


    render() {
        return (
            <div>

            </div>
        )
    }
}
