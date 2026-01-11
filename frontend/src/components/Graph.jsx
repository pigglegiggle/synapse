import React, { useEffect, useState, useRef } from 'react';
import Graph from 'react-vis-graph-wrapper';

const options = {
    layout: {
        hierarchical: false,
        randomSeed: 42
    },
    edges: {
        color: {
            color: "#d0d0d0",
            highlight: "#4a90e2",
            hover: "#4a90e2"
        },
        smooth: {
            type: "cubicBezier",
            forceDirection: "none",
            roundness: 0.3
        },
        width: 1,
        arrows: {
            to: { enabled: true, scaleFactor: 0.5 }
        }
    },
    nodes: {
        shape: "dot",
        size: 18,
        font: {
            size: 12,
            color: "#666666",
            face: 'system-ui',
            vadjust: -28
        },
        borderWidth: 2
    },
    physics: {
        enabled: true,
        stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100,
            onlyDynamicEdges: false,
            fit: true
        },
        solver: "barnesHut",
        barnesHut: {
            gravitationalConstant: -3000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        timestep: 0.5,
        adaptiveTimestep: true
    },
    interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
    }
};

const TransactionGraph = ({ transactions, onSelectNode }) => {
    const MAX_NODES = 35;
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const networkRef = useRef(null);

    useEffect(() => {
        const recentTxns = transactions.slice(-MAX_NODES);
        const nodes = new Map();
        const edges = [];
        const seenEdgeIds = new Set();

        recentTxns.forEach(t => {
            const isFraud = t.risk_score > 80;
            const isSus = t.risk_score > 50 && t.risk_score <= 80;

            const targetColor = isFraud
                ? { background: "#fee2e2", border: "#ef4444" }
                : isSus
                    ? { background: "#fed7aa", border: "#f97316" }
                    : { background: "#dbeafe", border: "#3b82f6" };

            const sourceColor = { background: "#e0f2fe", border: "#0ea5e9" };

            const getLabel = (acc) => {
                const parts = acc.split('-');
                return parts.length > 1 ? `${parts[0]}\n${parts[1].slice(-4)}` : acc;
            };

            if (!nodes.has(t.source)) {
                nodes.set(t.source, {
                    id: t.source,
                    label: getLabel(t.source),
                    color: isFraud ? { background: "#fee2e2", border: "#ef4444" } : sourceColor,
                    title: `Source: ${t.source}`
                });
            }

            if (!nodes.has(t.target)) {
                nodes.set(t.target, {
                    id: t.target,
                    label: getLabel(t.target),
                    color: targetColor,
                    title: `Receiver: ${t.target}`
                });
            }

            let edgeId = t.txn_id || `${t.source}-${t.target}-${t.timestamp}`;
            if (!seenEdgeIds.has(edgeId)) {
                seenEdgeIds.add(edgeId);
                edges.push({
                    from: t.source,
                    to: t.target,
                    id: edgeId,
                    title: `TX: ${t.txn_id}\nAmount: ${parseInt(t.amount).toLocaleString()} THB\nRisk: ${t.risk_score?.toFixed(0)}`,
                    color: isFraud ? "#ef4444" : isSus ? "#f97316" : "#d0d0d0",
                    width: isFraud ? 2 : 1
                });
            }
        });

        setGraphData({
            nodes: Array.from(nodes.values()),
            edges: edges
        });
    }, [transactions]);

    const hasFitted = useRef(false);

    // Auto Fit only ONCE when data first arrives
    useEffect(() => {
        if (networkRef.current && graphData.nodes.length > 0 && !hasFitted.current) {
            // Small delay to ensure canvas is ready and physics started
            const timer = setTimeout(() => {
                networkRef.current.fit({
                    animation: false,
                    nodes: graphData.nodes.map(n => n.id)
                });
                hasFitted.current = true;
            }, 800); // 800ms to allow initial physics to settle
            return () => clearTimeout(timer);
        }
    }, [graphData]);

    // Graph control listeners
    useEffect(() => {
        const handleZoomIn = () => {
            if (networkRef.current) {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale * 1.2 });
            }
        };

        const handleZoomOut = () => {
            if (networkRef.current) {
                const scale = networkRef.current.getScale();
                networkRef.current.moveTo({ scale: scale * 0.8 });
            }
        };

        const handleFit = () => {
            if (networkRef.current) {
                networkRef.current.fit({ animation: { duration: 500 } });
            }
        };

        window.addEventListener('graph-zoom-in', handleZoomIn);
        window.addEventListener('graph-zoom-out', handleZoomOut);
        window.addEventListener('graph-fit', handleFit);

        return () => {
            window.removeEventListener('graph-zoom-in', handleZoomIn);
            window.removeEventListener('graph-zoom-out', handleZoomOut);
            window.removeEventListener('graph-fit', handleFit);
        };
    }, []);

    const events = {
        select: function (event) {
            if (onSelectNode && event.nodes.length > 0) {
                onSelectNode(event.nodes[0]);
            }
        },
        stabilizationIterationsDone: function () {
            if (networkRef.current) {
                networkRef.current.fit({ animation: false });
            }
        }
    };

    return (
        <div className="h-full w-full relative">
            <Graph
                graph={graphData}
                options={options}
                events={events}
                getNetwork={(network) => {
                    networkRef.current = network;
                }}
                style={{ height: "100%", width: "100%" }}
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded border border-gray-200 p-2.5 text-xs shadow-sm">
                <div className="font-medium text-gray-700 mb-1.5 text-xs">Risk Level</div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500" style={{ background: '#dbeafe' }}></span>
                        <span className="text-gray-600">Low (0-50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-orange-500" style={{ background: '#fed7aa' }}></span>
                        <span className="text-gray-600">Medium (50-80)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-red-500" style={{ background: '#fee2e2' }}></span>
                        <span className="text-gray-600">High (80+)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionGraph;
