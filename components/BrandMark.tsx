import Image from "next/image";
import mark from "@/app/assets/mark.png";
import markLight from "@/app/assets/logowork-light.png";

/**
 * The Cosmonapse mark. Both artworks are emitted and CSS shows the one that
 * matches the active theme, so the markup is identical on server and client.
 */
export default function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <Image
        src={mark}
        alt=""
        width={34}
        height={34}
        className="logo-mark-img logo-mark-dark"
        priority={priority}
      />
      <Image
        src={markLight}
        alt=""
        width={42}
        height={34}
        className="logo-mark-img logo-mark-light"
        priority={priority}
      />
    </>
  );
}
