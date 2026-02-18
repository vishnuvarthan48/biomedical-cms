"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Upload, Trash2, Monitor } from "lucide-react";

const DEFAULT_DEVICE_IMAGE = "/images/default-device.jpg";

export function DeviceImageSection() {
  const [deviceImageUrl, setDeviceImageUrl] = useState<string | null>(null);
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDeviceImageUrl(url);
      setUseDefaultImage(false);
    }
  };

  const handleRemoveImage = () => {
    setDeviceImageUrl(null);
    setUseDefaultImage(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const displayImage =
    deviceImageUrl || (useDefaultImage ? DEFAULT_DEVICE_IMAGE : null);

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-base font-extrabold text-foreground mb-5">
        Device Image
      </h3>
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Image preview */}
        <div className="relative w-48 h-48 shrink-0 rounded-xl border-2 border-dashed border-border bg-muted/20 overflow-hidden group">
          {displayImage ? (
            <>
              <img
                src={displayImage}
                alt="Device"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              {useDefaultImage && !deviceImageUrl && (
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/70 text-background">
                  Default
                </span>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Monitor className="w-10 h-10" />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 justify-center">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 text-sm font-semibold gap-2"
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {deviceImageUrl ? "Change Image" : "Upload Image"}
          </Button>

          {deviceImageUrl && (
            <Button
              type="button"
              variant="outline"
              className="h-10 text-sm font-semibold gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
              onClick={handleRemoveImage}
            >
              <Trash2 className="w-4 h-4" />
              Remove Image
            </Button>
          )}

          <div className="flex items-center gap-2 mt-1">
            <Switch
              checked={useDefaultImage && !deviceImageUrl}
              onCheckedChange={(checked) => {
                if (!deviceImageUrl) setUseDefaultImage(checked);
              }}
              disabled={!!deviceImageUrl}
            />
            <Label className="text-sm text-muted-foreground font-medium cursor-pointer">
              Use default image when no photo uploaded
            </Label>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Upload a photo of the device. If no image is uploaded, a default
            device image will be displayed for all assets linked to this device.
          </p>
        </div>
      </div>
    </div>
  );
}
