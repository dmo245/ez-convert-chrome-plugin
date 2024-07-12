document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const droppedImage = document.getElementById('dropped-image');
  const formatSelect = document.getElementById('format');
  const compressionSelect = document.getElementById('compression');
  const downloadButton = document.getElementById('download');
  const compressValue = document.getElementById('compression-value');

  let originalImage = null;
  let imageData = null;
  let currentFileName = ''; // Variable to store the current file name

  const compressPNG = (canvas, compressionRate) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const decoded = UPNG.decode(uint8Array);
          const rgba = UPNG.toRGBA8(decoded)[0];
          const compressed = UPNG.encode([rgba], canvas.width, canvas.height, parseInt(compressionSelect.value) * 10);
          console.log(parseInt(compressionSelect.value) * 10);
          resolve(URL.createObjectURL(new Blob([compressed], { type: 'image/png' })));
        };
        reader.readAsArrayBuffer(blob);
      });
    });
  };

  const processImage = async () => {
    if (originalImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      const compressionRate = parseInt(compressionSelect.value) / 10;

      if (formatSelect.value === 'jpeg') {
        imageData = canvas.toDataURL('image/jpeg', compressionRate);
      } else if (formatSelect.value === 'webp') {
        imageData = canvas.toDataURL('image/webp', compressionRate);
      } else if (formatSelect.value === 'png') {
        imageData = await compressPNG(canvas, compressionRate);
      }

      droppedImage.src = imageData;
      droppedImage.style.display = 'block';
      // Set up download button with file name
      downloadButton.onclick = () => {
        const a = document.createElement('a');
        a.href = imageData;
        a.download = `${currentFileName}.${formatSelect.value}`; // Use the stored file name
        a.click();
      };
    }
  };

  const updateCompressionValue = () => {
    const compressionRate = parseInt(compressionSelect.value) / 10;
    compressValue.textContent = compressionRate;
  };

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    currentFileName = file.name.split('.').slice(0, -1).join('.'); // Store the file name
    const reader = new FileReader();
    reader.onload = (e) => {
      originalImage = new Image();
      originalImage.onload = () => {
        processImage(); // No need to pass file name
      };
      originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  formatSelect.addEventListener('change', () => {
    processImage(); // Use the stored file name
  });

  compressionSelect.addEventListener('input', () => {
    updateCompressionValue();
    processImage(); // Use the stored file name
  });

  // Initial compression value setup
  updateCompressionValue();
});