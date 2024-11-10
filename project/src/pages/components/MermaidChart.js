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
      console.log('render chart');
      // Initialize mermaid and render the chart only on the client side
      mermaid.initialize({
        startOnLoad: true,
      });

      try {
        // Ensure the chart is rendered after the component mounts
        mermaid.contentLoaded(); // Process the chart
      } catch (error) {
        console.error('Error rendering Mermaid chart:', error);
      }
    }
  }, [isClient, chart]); // Re-run when chart changes

  // Ensure the chart is rendered correctly
  useEffect(() => {
    if (isClient && chart) {
      // Use a timeout to ensure the DOM is fully updated before rendering
      const timeoutId = setTimeout(() => {
        mermaid.contentLoaded(); // Re-process the chart when it changes
      }, 0); // Delay to allow DOM updates

      return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
    }
  }, [chart, isClient]); // Re-run when chart changes

  if (!isClient) {
    // Return a placeholder during server-side rendering
    return null;
  }
  
  return <div className="mermaid">{chart}</div>;
};

export default MermaidChart;
