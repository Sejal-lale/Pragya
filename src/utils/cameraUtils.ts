/**
 * Camera & Dynamic Geo-Watermark Utilities
 * Provides camera stream control, frame capture, and on-canvas geo-watermarking.
 */

export interface WatermarkOptions {
  citizenName?: string;
  latitude: number;
  longitude: number;
  address: string;
  ward?: string;
  timestamp?: string;
  badgeTitle?: string;
}

/**
 * Start camera with specified facing mode ('user' for selfie, 'environment' for back camera)
 */
export async function startCameraStream(
  videoEl: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'environment'
): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera not supported in this browser environment.');
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

/**
 * Stop active media stream tracks
 */
export function stopCameraStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

/**
 * Capture frame from active video element to data URL
 */
export function captureVideoFrame(videoEl: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth || 640;
  canvas.height = videoEl.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Burn live dynamic geo-watermark directly into image canvas
 */
export async function stampGeoWatermark(
  imageSource: string,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // Draw original photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const bannerHeight = Math.max(90, Math.floor(height * 0.22));

      // Draw bottom gradient overlay for readability
      const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.2, 'rgba(10, 15, 30, 0.75)');
      gradient.addColorStop(1, 'rgba(5, 10, 25, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

      // Accent border line
      ctx.fillStyle = '#10B981'; // Emerald
      ctx.fillRect(0, height - bannerHeight + 4, width, 3);

      const padding = Math.max(16, Math.floor(width * 0.04));
      const startY = height - bannerHeight + Math.max(24, Math.floor(bannerHeight * 0.25));
      const fontSizeBadge = Math.max(10, Math.floor(width * 0.024));
      const fontSizeName = Math.max(13, Math.floor(width * 0.032));
      const fontSizeDetails = Math.max(10, Math.floor(width * 0.022));

      // 1. Badge Title
      ctx.font = `bold ${fontSizeBadge}px sans-serif`;
      ctx.fillStyle = '#34D399'; // Emerald 400
      const badge = options.badgeTitle || 'PRAGYA CITIZEN VERIFICATION • ON-SITE STAMP';
      ctx.fillText(`✓ ${badge}`, padding, startY);

      // 2. Citizen Name
      ctx.font = `bold ${fontSizeName}px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      const nameText = options.citizenName ? `Citizen: ${options.citizenName}` : 'Nagpur Verified Citizen';
      ctx.fillText(nameText, padding, startY + fontSizeName + 4);

      // 3. Address & Ward
      ctx.font = `normal ${fontSizeDetails}px sans-serif`;
      ctx.fillStyle = '#E5E7EB';
      const locText = `📍 ${options.address}${options.ward ? `, ${options.ward}` : ''}`;
      ctx.fillText(locText, padding, startY + fontSizeName + fontSizeDetails + 8);

      // 4. GPS Coordinates & Instant Timestamp
      const nowFormatted = options.timestamp || new Date().toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const coordsText = `🌐 GPS: ${options.latitude.toFixed(5)}° N, ${options.longitude.toFixed(5)}° E • ${nowFormatted}`;
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(coordsText, padding, startY + fontSizeName + (fontSizeDetails * 2) + 12);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      // Fallback if image load fails
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}

