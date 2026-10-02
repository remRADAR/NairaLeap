import { useEffect, useRef, useState } from "react";
import type { ServiceId } from "@/features/services/serviceCatalog";

const CROSSFADE_DURATION_MS = 700;

type BackgroundLayer = {
  key: number;
  serviceId: ServiceId;
  active: boolean;
};

interface PortalBackgroundProps {
  serviceId: ServiceId | null;
}

/** Keeps the current service image in place until the next image has loaded. */
export function PortalBackground({ serviceId }: PortalBackgroundProps) {
  const requestKey = useRef(0);
  const [layers, setLayers] = useState<BackgroundLayer[]>([]);

  useEffect(() => {
    const key = ++requestKey.current;
    let cancelled = false;
    let animationFrame = 0;
    let cleanupTimer = 0;

    const isCurrentRequest = () => !cancelled && requestKey.current === key;

    if (!serviceId) {
      setLayers((current) => current.map((layer) => ({ ...layer, active: false })));
      cleanupTimer = window.setTimeout(() => {
        if (isCurrentRequest()) setLayers([]);
      }, CROSSFADE_DURATION_MS + 80);
    } else {
      const image = new Image();
      let started = false;

      const beginCrossfade = () => {
        if (started || !isCurrentRequest()) return;
        started = true;

        setLayers((current) => {
          const outgoing = current.filter((layer) => layer.active).slice(-1);
          return [...outgoing, { key, serviceId, active: false }];
        });

        animationFrame = window.requestAnimationFrame(() => {
          if (!isCurrentRequest()) return;
          setLayers((current) => current.map((layer) => ({ ...layer, active: layer.key === key })));
          cleanupTimer = window.setTimeout(() => {
            if (isCurrentRequest()) {
              setLayers((current) => current.filter((layer) => layer.key === key));
            }
          }, CROSSFADE_DURATION_MS + 80);
        });
      };

      const revealWhenDecoded = () => {
        if (typeof image.decode !== "function") {
          beginCrossfade();
          return;
        }

        void image
          .decode()
          .then(beginCrossfade)
          .catch(() => {
            if (image.complete && image.naturalWidth > 0) beginCrossfade();
          });
      };

      image.decoding = "async";
      image.onload = revealWhenDecoded;
      image.onerror = () => {
        // Keep the last valid image (or the base gradient) rather than flashing a broken asset.
      };
      image.src = `/service-backgrounds/${serviceId}-background.webp`;
      if (image.complete && image.naturalWidth > 0) revealWhenDecoded();
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(cleanupTimer);
    };
  }, [serviceId]);

  return (
    <div
      aria-hidden="true"
      className="portal-background"
      data-testid="portal-background"
      data-target-service-id={serviceId ?? ""}
    >
      {layers.map((layer) => (
        <div
          key={layer.key}
          className="portal-background-layer"
          data-testid="portal-background-layer"
          data-service-id={layer.serviceId}
          data-active={layer.active ? "true" : "false"}
          style={{
            backgroundImage: `url("/service-backgrounds/${layer.serviceId}-background.webp")`,
          }}
        />
      ))}
    </div>
  );
}
