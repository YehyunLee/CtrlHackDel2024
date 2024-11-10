self.onmessage = function (e) {
  switch (e.data.command) {
    case 'process':
      const inputFrame = e.data.inputFrame
      // Here you would process the inputFrame and convert it to text
      // For demonstration purposes, we'll just return a dummy text
      const text = "Processed text from audio frame"
      self.postMessage({ command: 'result', text: text })
      break
  }
}