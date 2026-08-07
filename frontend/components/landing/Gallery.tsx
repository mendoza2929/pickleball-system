"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "../common/Container";

const galleryImages = [
  {
    id: 1,
    src: "/images/court1.jpg",
    title: "Championship Court",
    height: "h-[520px]",
  },
  {
    id: 2,
    src: "/images/court1.jpg",
    title: "Premium Facilities",
    height: "h-[250px]",
  },
  {
    id: 3,
     src: "/images/court1.jpg",
    title: "Training Session",
    height: "h-[350px]",
  },
  {
    id: 4,
     src: "/images/court2.jpg",
    title: "Tournament Day",
    height: "h-[420px]",
  },
  {
    id: 5,
     src: "/images/court2.jpg",
    title: "Night Play",
    height: "h-[300px]",
  },
  {
    id: 6,
     src: "/images/court2.jpg",
    title: "Community Match",
    height: "h-[520px]",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative py-32 overflow-hidden">

      <div className="blur-circle left-[-180px] top-10" />
      <div className="blur-circle right-[-150px] bottom-10" />

      <Container>

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="text-center"
        >
          <span className="section-badge">

            Gallery

          </span>

          <h2
            className="
              mt-6
              text-5xl
              lg:text-6xl
              font-black
            "
          >
            Experience

            <span className="text-gradient">

              {" "}RVS

            </span>

          </h2>

          <p
            className="
              mt-6
              mx-auto
              max-w-3xl
              text-lg
              leading-8
              text-slate-400
            "
          >
            Discover our premium courts, facilities,
            tournaments and unforgettable pickleball moments.
          </p>

        </motion.div>

        {/* Gallery */}

        <div
          className="
            mt-20
            columns-1
            md:columns-2
            xl:columns-3
            gap-6
            space-y-6
          "
        >

          {galleryImages.map((image, index) => (

            <motion.div
              key={image.id}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: index * .08,
                duration: .7,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                break-inside-avoid
                cursor-pointer
              "
            >

              <div className={`relative ${image.height}`}>

                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-110
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/80
                    via-transparent
                    to-transparent
                    opacity-80
                  "
                />

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileHover={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    absolute
                    bottom-8
                    left-8
                  "
                >

                  <h3
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    {image.title}
                  </h3>

                </motion.div>

              </div>

            </motion.div>

          ))}

        </div>

      </Container>

    </section>
  );
}