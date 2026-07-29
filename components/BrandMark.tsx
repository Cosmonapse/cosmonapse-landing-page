import Image from "next/image";
import mark from "@/app/assets/logowork.png";
import markLight from "@/app/assets/logowork-light.png";

/**
 * The Cosmonapse mark. Both artworks are emitted and CSS shows the one that
 * matches the active theme, so the markup is identical on server and client.
 *
 * Both source PNGs are cropped to the same bounding box (icon only, no
 * wordmark) and share the same aspect ratio, so both <Image> instances use
 * identical width/height here to avoid the light/dark size mismatch.
 */
export default function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <Image
        src={mark}
        alt=""
        width={44}
        height={34}
        className="logo-mark-img logo-mark-dark"
        priority={priority}
      />
      <Image
        src={markLight}
        alt=""
        width={44}
        height={34}
        className="logo-mark-img logo-mark-light"
        priority={priority}
      />
    </>
  );
}
