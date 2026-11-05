"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/*
 * Arche de /formations/metiers-du-numerique : un vrai <button> à deux battants (moitiés de l'image 1)
 * qui s'écartent sur l'image 2. Seul îlot client du hero. Motion : LazyMotion + domAnimation, composants
 * `m`, courbe unique ; uniquement transform, opacity, clip-path et pathLength. Mouvement réduit : aucune
 * entrée ni teaser, l'image 2 apparaît par un fondu de 200 ms. Éléments à état initial caché : `data-reveal`.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const SIZES = "(min-width: 1024px) 400px, 80vw";
const OPEN_X = 95; // % de la largeur d'un battant
const TEASER_X = 6; // ≈ 6 % de l'arche au total
const TEASER_AT_MS = 2600; // fin de l'entrée (≈ 1,1 s) + 1,5 s
const TEASER_MS = 700;
const LEAVE_DELAY_MS = 150;

type Photos = { formation: string | null; situation: string | null };

/** Photo (cadre `fill`) ou, tant qu'elle manque, placeholder : un cercle doré (image 1) ou deux (image 2). */
function Visual({ src, rings, priority, eager }: { src: string | null; rings: 1 | 2; priority?: boolean; eager?: boolean }) {
  if (!src) {
    return (
      <span className="mh-placeholder" aria-hidden="true">
        <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" focusable="false">
          {(rings === 1 ? [60] : [40, 80]).map((r) => (
            <circle key={r} cx={150} cy={200} r={r} />
          ))}
        </svg>
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={SIZES}
      priority={priority}
      loading={eager ? "eager" : undefined}
      fetchPriority={eager && !priority ? "low" : undefined}
      className="mh-img"
    />
  );
}

export function MetiersArche({ photos }: { photos: Photos }) {
  const reduce = useReducedMotionSafe();
  const [hover, setHover] = useState(false);
  const [locked, setLocked] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const touched = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const open = locked || hover;
  const tween = (duration: number, delay = 0) => (reduce ? { duration: 0 } : { duration, delay, ease: EASE });
  const swap = reduce ? { duration: 0.2 } : { duration: 0.7, ease: EASE };

  // Teaser unique, seulement si le visiteur n'a rien touché
  useEffect(() => {
    if (reduce) return;
    let end: ReturnType<typeof setTimeout> | undefined;
    const start = setTimeout(() => {
      if (touched.current) return;
      setTeaser(true);
      end = setTimeout(() => setTeaser(false), TEASER_MS);
    }, TEASER_AT_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [reduce]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  const interact = () => {
    touched.current = true;
    setTeaser(false);
  };

  const leafX = open ? OPEN_X : teaser ? TEASER_X : 0;
  const leafAnimate = (sign: 1 | -1) => (reduce ? { opacity: open ? 0 : 1 } : { x: `${sign * leafX}%` });
  const fadeWhenOpen = { opacity: open ? 0 : 1 };
  const zoom = { initial: reduce ? false : { scale: 1.06 }, animate: { scale: 1 }, transition: tween(0.9, 0.2) } as const;

  return (
    <LazyMotion features={domAnimation} strict>
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}"}</style>
      </noscript>
      <div className="mh-arche">
        <div className="mh-stage">
          <m.div
            className="mh-outline"
            aria-hidden="true"
            data-reveal=""
            initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={tween(0.9, 0.3)}
          />

          <button
            type="button"
            className="mh-door"
            aria-pressed={locked}
            aria-label={open ? "Revenir à l'image : en formation" : "Voir l'image suivante : en situation professionnelle"}
            onPointerEnter={(e) => {
              if (e.pointerType === "touch") return;
              interact();
              clearTimeout(leaveTimer.current);
              setHover(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "touch") return;
              clearTimeout(leaveTimer.current);
              leaveTimer.current = setTimeout(() => setHover(false), LEAVE_DELAY_MS);
            }}
            onClick={() => {
              interact();
              setLocked((v) => !v);
            }}
          >
            <m.span
              className="mh-clip"
              data-reveal=""
              initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={tween(0.9, 0.2)}
            >
              {/* Image 2, pleine forme */}
              <m.span className="mh-fill" {...zoom}>
                <Visual src={photos.situation} rings={2} eager />
              </m.span>

              {/* Battants : moitiés gauche et droite de l'image 1 (même image à 200 %) */}
              {([-1, 1] as const).map((sign) => (
                <m.span
                  key={sign}
                  className={sign === -1 ? "mh-leaf mh-leaf-l" : "mh-leaf mh-leaf-r"}
                  initial={false}
                  animate={leafAnimate(sign)}
                  transition={swap}
                >
                  <m.span className={sign === -1 ? "mh-half mh-half-l" : "mh-half mh-half-r"} {...zoom}>
                    <Visual src={photos.formation} rings={1} priority={sign === -1} eager={sign === 1} />
                  </m.span>
                  <m.span className="mh-edge" aria-hidden="true" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={tween(0.25)} />
                </m.span>
              ))}

              {/* Voile bleu nuit fixe, au-dessus des deux images, sous la couture et la poignée */}
              <span className="mh-veil" aria-hidden="true" />

              <m.span className="mh-seam" aria-hidden="true" initial={false} animate={fadeWhenOpen} transition={tween(0.25)} />
              <m.span
                className="mh-slit"
                aria-hidden="true"
                initial={false}
                animate={{ opacity: reduce ? 0 : open ? [0, 0.6, 0] : teaser ? 0.6 : 0 }}
                transition={open ? { duration: 0.7, times: [0, 0.35, 1], ease: EASE } : tween(0.35)}
              />
              <m.span className="mh-handle" aria-hidden="true" initial={false} animate={fadeWhenOpen} transition={tween(0.25)}>
                <span className="mh-handle-dot" />
              </m.span>
            </m.span>
          </button>
        </div>

        <m.p
          className="mh-caption"
          data-reveal=""
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={tween(0.45, 1.1)}
        >
          <m.span className="mh-cap" aria-hidden={open} initial={false} animate={fadeWhenOpen} transition={tween(0.25)}>
            <span className="mh-cap-n">01</span> En formation
          </m.span>
          <m.span className="mh-cap" aria-hidden={!open} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={tween(0.25)}>
            <span className="mh-cap-n">02</span> En situation professionnelle
          </m.span>
        </m.p>
      </div>
    </LazyMotion>
  );
}
