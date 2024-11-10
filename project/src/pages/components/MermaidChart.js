import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

const MermaidChart = ({ chart }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true when the component mounts (only on the client side)
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && chart) {
      // Initialize mermaid and render the chart only on the client side
      mermaid.initialize({
        startOnLoad: true,
      });

      try {
        mermaid.contentLoaded(); // Process the chart
      } catch (error) {
        console.error('Error rendering Mermaid chart:', error);
      }
    }
  }, [isClient, chart]); // Re-run when chart changes

  if (!isClient) {
    // Return a placeholder during server-side rendering
    return null;
  }

  return <div className="mermaid">{chart}</div>;
};

export default MermaidChart;
