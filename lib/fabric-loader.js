// Fabric.js loader for Next.js compatibility - CDN only approach
let fabricInstance = null;

export const loadFabric = async () => {
  if (typeof window === "undefined") {
    // Server-side rendering, return null
    return null;
  }

  if (fabricInstance) {
    return fabricInstance;
  }

  // Check if fabric is already loaded
  if (window.fabric) {
    fabricInstance = window.fabric;
    return fabricInstance;
  }

  // Load Fabric.js from CDN with fallback
  return new Promise((resolve, reject) => {
    if (document.getElementById("fabric-script")) {
      // Script already exists, wait for it to load
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkFabric = () => {
        if (window.fabric) {
          fabricInstance = window.fabric;
          resolve(fabricInstance);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkFabric, 100);
        } else {
          reject(new Error("Fabric.js failed to load from existing script"));
        }
      };
      checkFabric();
      return;
    }

    const script = document.createElement("script");
    script.id = "fabric-script";
    script.src =
      "https://cdn.jsdelivr.net/npm/fabric@latest/dist/fabric.min.js";
    script.crossOrigin = "anonymous";

    script.onload = () => {
      // Wait a bit for fabric to be fully available
      setTimeout(() => {
        if (window.fabric) {
          fabricInstance = window.fabric;
          resolve(fabricInstance);
        } else {
          reject(new Error("Fabric.js loaded but fabric object not available"));
        }
      }, 100);
    };

    script.onerror = () => {
      console.error(
        "Failed to load Fabric.js from primary CDN, trying fallback..."
      );
      // Try fallback CDN
      const fallbackScript = document.createElement("script");
      fallbackScript.id = "fabric-script-fallback";
      fallbackScript.src = "https://unpkg.com/fabric@latest/dist/fabric.min.js";
      fallbackScript.crossOrigin = "anonymous";

      fallbackScript.onload = () => {
        setTimeout(() => {
          if (window.fabric) {
            fabricInstance = window.fabric;
            resolve(fabricInstance);
          } else {
            reject(
              new Error(
                "Fabric.js loaded from fallback but fabric object not available"
              )
            );
          }
        }, 100);
      };

      fallbackScript.onerror = () => {
        console.error("Failed to load Fabric.js from fallback CDN");
        reject(
          new Error(
            "Failed to load Fabric.js from both primary and fallback CDNs"
          )
        );
      };

      document.head.appendChild(fallbackScript);
    };

    document.head.appendChild(script);
  });
};

export const useFabric = () => {
  return fabricInstance;
};

