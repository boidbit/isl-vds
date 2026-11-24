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
# ---- village / treasure set (sone-ka-matka) ----
# hoe into dry soil
gen -f lavfi -i "anoisesrc=color=brown:amplitude=1:duration=0.3:seed=21" -af "lowpass=f=900,highpass=f=60,afade=t=in:d=0.005,afade=t=out:st=0.04:d=0.26:curve=exp,volume=2.5" dig.wav
# metal/stone hit: "TAK!"
gen -f lavfi -i "aevalsrc=0.9*sin(2*PI*1850*t)*exp(-30*t)+0.6*sin(2*PI*2730*t)*exp(-38*t)+0.4*sin(2*PI*620*t)*exp(-18*t):d=0.6" -af "volume=1.3" tak.wav
# clay lid scraping open
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.7:duration=0.9:seed=23" -af "bandpass=f=900:width_type=o:w=1.2,tremolo=f=22:d=0.6,afade=t=in:d=0.1,afade=t=out:st=0.6:d=0.3,volume=2" lid.wav
# gold shimmer (rising chimes)
gen -f lavfi -i "aevalsrc=0.25*sin(2*PI*1568*t)*exp(-3*t)+0.22*sin(2*PI*2093*(t-0.12))*exp(-3*(t-0.12))*gt(t\,0.12)+0.2*sin(2*PI*2637*(t-0.24))*exp(-3*(t-0.24))*gt(t\,0.24)+0.18*sin(2*PI*3136*(t-0.36))*exp(-3*(t-0.36))*gt(t\,0.36):d=1.8" -af "aecho=0.8:0.6:120:0.35,volume=1.6" shimmer.wav
# whoosh for fast cuts
gen -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=0.45:seed=25" -af "highpass=f=300,lowpass=f=5000,afade=t=in:d=0.2:curve=exp,afade=t=out:st=0.2:d=0.25,volume=1.6" whoosh.wav
# low impact boom for the hook / twist
gen -f lavfi -i "aevalsrc=0.9*sin(2*PI*(70-30*t)*t)*exp(-5*t):d=1.2" -af "volume=1.8" impact.wav
# suspense riser
gen -f lavfi -i "aevalsrc=0.25*sin(2*PI*(180+500*t*t/4)*t)*(t/2.2):d=2.2" -af "aecho=0.8:0.5:60:0.3,afade=t=out:st=2.0:d=0.2,volume=1.6" riser.wav
# wooden door creak
gen -f lavfi -i "aevalsrc=0.3*sin(2*PI*(260+120*sin(2*PI*3*t))*t)*(1-t/1.1):d=1.1" -af "tremolo=f=30:d=0.7,lowpass=f=2500,volume=1.6" door.wav
# knock
gen -f lavfi -i "aevalsrc=0.9*sin(2*PI*180*t)*exp(-40*t)+0.9*sin(2*PI*180*(t-0.22))*exp(-40*(t-0.22))*gt(t\,0.22):d=0.6" -af "lowpass=f=1200,volume=2" knock.wav
# birds chirping (short phrase)
gen -f lavfi -i "aevalsrc=0.15*sin(2*PI*(3200+900*sin(2*PI*14*t))*t)*gt(sin(2*PI*2.6*t)\,0.55):d=2.5" -af "volume=1.4" birds.wav
# soft bell / chime at the end
gen -f lavfi -i "aevalsrc=0.35*sin(2*PI*880*t)*exp(-1.6*t)+0.2*sin(2*PI*1320*t)*exp(-2.2*t)+0.12*sin(2*PI*1760*t)*exp(-3*t):d=3" chime.wav
# warm pad (gentle, for the emotional ending)
gen -f lavfi -i "aevalsrc=0.12*sin(2*PI*220*t)+0.1*sin(2*PI*277.2*t)+0.09*sin(2*PI*329.6*t)+0.05*sin(2*PI*440*t):d=10" -af "tremolo=f=0.4:d=0.3,afade=t=in:d=1.5,afade=t=out:st=8:d=2,lowpass=f=1800,volume=1.4" pad.wav
# village ambience: light wind + distant birds
gen -f lavfi -i "anoisesrc=color=brown:amplitude=0.4:duration=40:seed=31" -f lavfi -i "aevalsrc=0.04*sin(2*PI*(3400+700*sin(2*PI*11*t))*t)*gt(sin(2*PI*0.4*t)\,0.85):d=40" -filter_complex "[0]highpass=f=80,lowpass=f=600,tremolo=f=0.15:d=0.5[a];[a][1]amix=inputs=2:weights=1 1,volume=1.4" -b:a 96k village-ambience.mp3
ls -la
