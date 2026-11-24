#!/usr/bin/env bash
# Procedural sound effects (no downloads, no licences). Re-run to regenerate public/sfx/.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
gen() { ffmpeg -hide_banner -loglevel error -y "$@"; }
# soft footstep in sand
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.9:duration=0.16:seed=3" -af "lowpass=f=700,highpass=f=80,afade=t=in:d=0.01,afade=t=out:st=0.03:d=0.13,volume=2.2" step.wav
# splash / chhap-chhap
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.7:duration=0.6:seed=5" -af "highpass=f=900,lowpass=f=6000,afade=t=in:d=0.005,afade=t=out:st=0.05:d=0.55:curve=exp,volume=1.4" splash.wav
# water drop (plink)
gen -f lavfi -i "aevalsrc=0.6*sin(2*PI*(1400-900*t)*t)*exp(-22*t):d=0.35" drip.wav
# one panting breath
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=0.2:seed=7" -af "highpass=f=600,lowpass=f=2600,afade=t=in:d=0.06,afade=t=out:st=0.08:d=0.12,volume=1.6" pant.wav
# lapping water
gen -f lavfi -i "anoisesrc=color=white:amplitude=0.6:duration=0.09:seed=9" -af "highpass=f=1200,lowpass=f=4500,afade=t=in:d=0.005,afade=t=out:st=0.02:d=0.07,volume=1.3" lap.wav
# hand on stone
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=0.25:seed=11" -af "highpass=f=250,lowpass=f=1500,afade=t=in:d=0.01,afade=t=out:st=0.05:d=0.2,volume=1.5" scrape.wav
ls -la
