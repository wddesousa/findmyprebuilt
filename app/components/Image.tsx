"use client";
import { CldImage, CldImageProps  } from "next-cloudinary";

export default function Image(props: CldImageProps ){
  return <CldImage {...props} />;
}
