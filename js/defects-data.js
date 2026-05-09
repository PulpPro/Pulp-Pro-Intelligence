const DEFECTS_DATA = {
    banana: {
        external: [
            {
                id: 'ban_ext_01',
                name: 'Bruising',
                description: 'Dark soft patches on skin caused by impact or pressure',
                severity: 'minor',
                action: 'Monitor closely. Minor bruising is acceptable for immediate sale.'
            },
            {
                id: 'ban_ext_02',
                name: 'Skin Splitting',
                description: 'Longitudinal or transverse cracks in the peel',
                severity: 'major',
                action: 'Prioritise for immediate sale or processing. Not suitable for long transport.'
            },
            {
                id: 'ban_ext_03',
                name: 'Mould on Skin',
                description: 'Visible fungal growth on the outer peel surface',
                severity: 'critical',
                action: 'Reject immediately. Risk of contamination to surrounding fruit.'
            },
            {
                id: 'ban_ext_04',
                name: 'Colour Deviation',
                description: 'Uneven yellowing, green patches or abnormal brown discolouration',
                severity: 'minor',
                action: 'Acceptable if minor. Monitor ripening stage carefully.'
            },
            {
                id: 'ban_ext_05',
                name: 'Mechanical Damage',
                description: 'Cuts, abrasions or punctures on the skin surface',
                severity: 'major',
                action: 'Separate from batch. Damaged skin accelerates ripening and decay.'
            },
            {
                id: 'ban_ext_06',
                name: 'Latex Staining',
                description: 'Dark sticky residue from latex on skin surface',
                severity: 'minor',
                action: 'Cosmetic issue only. Does not affect internal quality.'
            },
            {
                id: 'ban_ext_07',
                name: 'Scarring',
                description: 'Healed surface scars from insects or friction',
                severity: 'minor',
                action: 'Acceptable unless affecting more than 20% of surface area.'
            },
            {
                id: 'ban_ext_08',
                name: 'Deformity',
                description: 'Abnormal shape, curved fingers or missing sections',
                severity: 'minor',
                action: 'Cosmetic defect only. Does not affect taste or safety.'
            },
            {
                id: 'ban_ext_09',
                name: 'Tip Rot',
                description: 'Dark mushy deterioration at the tip of the finger',
                severity: 'major',
                action: 'Remove affected fingers. Check adjacent fruit for spread.'
            },
            {
                id: 'ban_ext_10',
                name: 'Crown Rot',
                description: 'Fungal decay at the crown where fingers join the hand',
                severity: 'critical',
                action: 'Reject entire hand. Highly contagious to rest of batch.'
            }
        ],
        internal: [
            {
                id: 'ban_int_01',
                name: 'Flesh Discolouration',
                description: 'Brown or grey streaks in the flesh when cut open',
                severity: 'major',
                action: 'Not suitable for fresh sale. Can be used for processing if minor.'
            },
            {
                id: 'ban_int_02',
                name: 'Internal Rot',
                description: 'Soft mushy areas inside the flesh with fermented smell',
                severity: 'critical',
                action: 'Reject immediately. Not fit for consumption.'
            },
            {
                id: 'ban_int_03',
                name: 'Hard Core',
                description: 'Firm unripened central core remaining in ripe fruit',
                severity: 'minor',
                action: 'Monitor ripening. Allow additional time at room temperature.'
            },
            {
                id: 'ban_int_04',
                name: 'Vascular Browning',
                description: 'Brown discolouration along vascular bundles in cross section',
                severity: 'major',
                action: 'Separate from batch. Indicates chilling injury or disease.'
            },
            {
                id: 'ban_int_05',
                name: 'Overripeness',
                description: 'Overly soft flesh with fermented or alcoholic smell',
                severity: 'major',
                action: 'Use immediately for processing only. Not suitable for fresh sale.'
            },
            {
                id: 'ban_int_06',
                name: 'Insect Damage',
                description: 'Tunnels or cavities inside flesh caused by insects',
                severity: 'critical',
                action: 'Reject entire batch. Report infestation immediately.'
            },
            {
                id: 'ban_int_07',
                name: 'Abnormal Flavour',
                description: 'Off taste, sourness or chemical flavour detected on tasting',
                severity: 'major',
                action: 'Reject for fresh sale. Investigate storage and transport conditions.'
            }
        ]
    },

    mango: {
        external: [
            {
                id: 'man_ext_01',
                name: 'Skin Blemishes',
                description: 'Dark spots, scabs or surface marks on the skin',
                severity: 'minor',
                action: 'Acceptable if covering less than 10% of surface. Grade down if more.'
            },
            {
                id: 'man_ext_02',
                name: 'Soft Spots',
                description: 'Localised soft or sunken areas on the skin surface',
                severity: 'major',
                action: 'Prioritise for immediate sale. Check for internal decay below spot.'
            },
            {
                id: 'man_ext_03',
                name: 'Anthracnose',
                description: 'Black sunken lesions on skin caused by fungal infection',
                severity: 'critical',
                action: 'Reject and isolate immediately. Highly contagious fungal disease.'
            },
            {
                id: 'man_ext_04',
                name: 'Stem End Rot',
                description: 'Dark watery decay starting at the stem end',
                severity: 'critical',
                action: 'Reject immediately. Spreads rapidly through the flesh.'
            },
            {
                id: 'man_ext_05',
                name: 'Colour Unevenness',
                description: 'Patchy uneven colour development across the skin',
                severity: 'minor',
                action: 'Cosmetic issue. Monitor ripening for further development.'
            },
            {
                id: 'man_ext_06',
                name: 'Cuts and Abrasions',
                description: 'Physical damage to skin surface from handling or transport',
                severity: 'major',
                action: 'Separate from batch. Broken skin accelerates decay.'
            },
            {
                id: 'man_ext_07',
                name: 'Resin Tapping Marks',
                description: 'Dried resin deposits or marks from latex flow on skin',
                severity: 'minor',
                action: 'Cosmetic only. Does not affect internal quality.'
            },
            {
                id: 'man_ext_08',
                name: 'Insect Stings',
                description: 'Small puncture marks from insect feeding on skin',
                severity: 'major',
                action: 'Check for internal damage. Entry points for decay organisms.'
            },
            {
                id: 'man_ext_09',
                name: 'Sunburn',
                description: 'Pale or white bleached patches from excessive sun exposure',
                severity: 'minor',
                action: 'Cosmetic defect. Check internal flesh for heat damage.'
            },
            {
                id: 'man_ext_10',
                name: 'Shrivel',
                description: 'Wrinkled or shrivelled skin indicating moisture loss',
                severity: 'major',
                action: 'Prioritise for immediate sale. Indicates poor storage conditions.'
            }
        ],
        internal: [
            {
                id: 'man_int_01',
                name: 'Seed Weevil Damage',
                description: 'Cavities or tunnels around or inside the seed',
                severity: 'critical',
                action: 'Reject entire batch. Quarantine pest — must be reported.'
            },
            {
                id: 'man_int_02',
                name: 'Flesh Browning',
                description: 'Brown or oxidised patches in the flesh when cut',
                severity: 'major',
                action: 'Not suitable for fresh sale. Investigate chilling or storage cause.'
            },
            {
                id: 'man_int_03',
                name: 'Jelly Seed',
                description: 'Translucent gel-like breakdown of flesh near the seed',
                severity: 'minor',
                action: 'Natural physiological disorder. Acceptable for immediate consumption.'
            },
            {
                id: 'man_int_04',
                name: 'Internal Breakdown',
                description: 'Soft watery or fermented flesh inside despite firm exterior',
                severity: 'critical',
                action: 'Reject immediately. Not fit for consumption.'
            },
            {
                id: 'man_int_05',
                name: 'Fibre Excess',
                description: 'Abnormally high fibre content making flesh stringy and tough',
                severity: 'minor',
                action: 'Quality issue only. Suitable for processing not fresh sale.'
            },
            {
                id: 'man_int_06',
                name: 'Turpentine Flavour',
                description: 'Strong resinous or turpentine taste in the flesh',
                severity: 'major',
                action: 'Reject for fresh sale. May indicate variety or harvesting issue.'
            },
            {
                id: 'man_int_07',
                name: 'Uneven Ripening',
                description: 'Hard unripe patches alongside soft ripe areas inside',
                severity: 'minor',
                action: 'Allow additional ripening time. Monitor temperature.'
            }
        ]
    },

    avocado: {
        external: [
            {
                id: 'avo_ext_01',
                name: 'Skin Bruising',
                description: 'Soft sunken dark patches on the outer skin surface',
                severity: 'minor',
                action: 'Check internal flesh below bruise. Minor bruising acceptable.'
            },
            {
                id: 'avo_ext_02',
                name: 'Stem Absence',
                description: 'Missing or dislodged stem button at the top of fruit',
                severity: 'major',
                action: 'Entry point for decay. Prioritise for immediate sale.'
            },
            {
                id: 'avo_ext_03',
                name: 'Skin Cracking',
                description: 'Surface cracks in the skin exposing flesh underneath',
                severity: 'major',
                action: 'Separate from batch. High risk of contamination and decay.'
            },
            {
                id: 'avo_ext_04',
                name: 'Mould',
                description: 'Visible fungal growth on skin surface',
                severity: 'critical',
                action: 'Reject immediately. Contamination risk to entire batch.'
            },
            {
                id: 'avo_ext_05',
                name: 'Lenticel Damage',
                description: 'Darkened or enlarged pores on skin surface',
                severity: 'minor',
                action: 'Cosmetic only. Monitor for further development.'
            },
            {
                id: 'avo_ext_06',
                name: 'Scab',
                description: 'Rough corky patches or lesions on skin',
                severity: 'minor',
                action: 'Cosmetic defect only. Does not affect internal quality.'
            },
            {
                id: 'avo_ext_07',
                name: 'Sunblotch',
                description: 'Yellow or red discoloured patches from sun exposure',
                severity: 'major',
                action: 'Check internal flesh. May indicate internal quality issues.'
            },
            {
                id: 'avo_ext_08',
                name: 'Mechanical Damage',
                description: 'Cuts, gouges or punctures from handling',
                severity: 'major',
                action: 'Separate immediately. Broken skin accelerates oxidation and decay.'
            }
        ],
        internal: [
            {
                id: 'avo_int_01',
                name: 'Flesh Browning',
                description: 'Brown or black discolouration in flesh when cut open',
                severity: 'major',
                action: 'Not suitable for fresh sale. Investigate cold chain issues.'
            },
            {
                id: 'avo_int_02',
                name: 'Vascular Browning',
                description: 'Brown discolouration along vascular strands in flesh',
                severity: 'major',
                action: 'Reject for fresh sale. Indicates chilling injury.'
            },
            {
                id: 'avo_int_03',
                name: 'Seed Cavity Mould',
                description: 'Fungal growth inside the seed cavity',
                severity: 'critical',
                action: 'Reject immediately. Not fit for consumption.'
            },
            {
                id: 'avo_int_04',
                name: 'Grey Pulp',
                description: 'Grey discolouration of flesh indicating physiological disorder',
                severity: 'critical',
                action: 'Reject immediately. Not fit for consumption.'
            },
            {
                id: 'avo_int_05',
                name: 'Internal Bruising',
                description: 'Dark soft patches in flesh not visible from outside',
                severity: 'major',
                action: 'Not suitable for fresh sale. Can be used for processing if limited.'
            },
            {
                id: 'avo_int_06',
                name: 'Seed Cracking',
                description: 'Cracked or broken seed causing flesh discolouration',
                severity: 'minor',
                action: 'Monitor quality. May affect shelf life.'
            },
            {
                id: 'avo_int_07',
                name: 'Off Flavour',
                description: 'Rancid, bitter or abnormal taste in the flesh',
                severity: 'major',
                action: 'Reject for fresh sale. Investigate storage and ripening conditions.'
            },
            {
                id: 'avo_int_08',
                name: 'Uneven Ripening',
                description: 'Hard unripe patches alongside soft overripe areas',
                severity: 'minor',
                action: 'Allow additional ripening time at room temperature.'
            }
        ]
    }
};
