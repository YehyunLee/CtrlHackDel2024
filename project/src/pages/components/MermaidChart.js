// components/MermaidChart.js
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidChart = ({ chart }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    // Initialize Mermaid.js when the component mounts
    mermaid.initialize({ startOnLoad: true });

    // Render the chart if the reference exists
    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div
      ref={mermaidRef}
      className="mermaid"
      dangerouslySetInnerHTML={{ __html: chart }}
    />
  );
};

export default MermaidChart;
