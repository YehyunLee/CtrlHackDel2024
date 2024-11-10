import { useEffect } from 'react';
import mermaid from 'mermaid';

const MermaidChart = ({ chart }) => {
  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
    });

    // Render the chart
    const renderChart = () => {
      try {
        mermaid.contentLoaded();
      } catch (error) {
        console.error("Error rendering Mermaid chart:", error);
      }
    };

    // Delay rendering until after the component is mounted
    setTimeout(renderChart, 100);

  }, [chart]); // Re-run the effect if `chart` prop changes

  return (
    <div className="mermaid">
      {chart}
    </div>
  );
};

export default MermaidChart;
