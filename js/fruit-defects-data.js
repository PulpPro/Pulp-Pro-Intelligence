// ============================================================
// PULP PRO — FRUIT DEFECTS DATA
// Banana, Mango, Avocado — English + Dutch
// Free-use images from Wikimedia Commons & open-access sources
// Your own photos: place in images/defects/ in your repo
// ============================================================

const FRUIT_DEFECTS = {

    // ═══════════════════════════════════════════════════════════
    // BANANA
    // ═══════════════════════════════════════════════════════════
    banana: {
        external: [
            {
                id: 'b-impact-bruising',
                severity: 'major',
                emoji: '🟤',
                images: [
                    'images/defects/banana-bruising-1.jpg',
                    'images/defects/banana-bruising-2.jpg',
                ],
                en: {
                    name: 'Impact Bruising',
                    shortDesc: 'Internal flesh browning, skin often intact',
                    whatIsIt: 'Impact bruising occurs when bananas are dropped or compressed, causing cellular damage beneath the skin. The flesh browns and softens while the skin may remain visually intact — making early detection very difficult on green fruit. It is one of the most common and costly postharvest defects in the banana industry.',
                    howToIdentify: 'On green fruit bruising is invisible until ripening begins. When ripe, the bruised area turns dark brown or black and feels soft when pressed. Cross-section shows brown discolouration of the flesh, often spreading outward from the point of impact. The bruised area will ripen faster than surrounding tissue, causing uneven colour development.',
                    causes: 'Dropping during harvest or packing. Compression from stacking boxes too high. Rough handling during transport. Impact against hard surfaces on the packing line. Harvesting at too mature a stage when flesh is softer and more susceptible.',
                    shipmentImpact: 'Bruised areas accelerate ripening and create direct entry points for fungal decay. Can reduce shelf life by 2–4 days. In severe cases bruising spreads throughout the flesh. Invisible during loading inspection and only discovered on arrival or at retail level.',
                    temperatureEffects: 'Chilled fruit is more susceptible to bruising — below 13°C the peel becomes more brittle and bruises more easily. Damage at low temperature may not show until fruit warms up to ripening conditions. Never drop or compress cold fruit.',
                    acceptReject: 'Minor bruising less than 5% of finger surface: Accept with note. Moderate bruising 5–10%: Downgrade. Severe bruising with visible softening, discolouration or multiple fingers affected: Reject.',
                    prevention: 'Handle all boxes carefully at every stage. Never drop from heights above 30cm. Do not stack more than the recommended box height. Use padded conveyors and handling equipment. Harvest at correct maturity stage.',
                },
                nl: {
                    name: 'Stootbeschadiging',
                    shortDesc: 'Interne bruinkleuring vruchtvlees, schil vaak intact',
                    whatIsIt: 'Stootbeschadiging treedt op wanneer bananen worden gevallen of samengedrukt, waardoor cellulaire schade onder de schil ontstaat. Het vruchtvlees verkleurt bruin en wordt zacht terwijl de schil visueel intact kan blijven — dit maakt vroege detectie bij groen fruit zeer moeilijk. Het is een van de meest voorkomende en kostbare post-oogst gebreken in de bananenindustrie.',
                    howToIdentify: 'Bij groen fruit is beschadiging onzichtbaar totdat rijping begint. Wanneer rijp, wordt het beschadigde gebied donkerbruin of zwart en voelt zacht aan bij druk. Dwarsdoorsnede toont bruinkleuring van het vruchtvlees, vaak uitspreidend vanuit het impactpunt. Het beschadigde gebied rijpt sneller dan omliggend weefsel.',
                    causes: 'Vallen tijdens oogst of verpakking. Samendrukking door te hoog stapelen van dozen. Ruw behandelen tijdens transport. Impact tegen harde oppervlakken op de verpakkingslijn. Oogsten op een te rijp stadium wanneer het vruchtvlees zachter en vatbaarder is.',
                    shipmentImpact: 'Beschadigde gebieden versnellen rijping en creëren directe ingangen voor schimmelrot. Kan houdbaarheid met 2–4 dagen verminderen. Bij ernstige gevallen verspreidt beschadiging zich door het vruchtvlees. Onzichtbaar tijdens laadcontrole en pas ontdekt bij aankomst of in de winkel.',
                    temperatureEffects: 'Gekoeld fruit is gevoeliger voor stootschade — onder 13°C wordt de schil brozer en beschadigt gemakkelijker. Schade bij lage temperatuur is mogelijk pas zichtbaar nadat fruit opwarmt naar rijpingsomstandigheden. Nooit koud fruit laten vallen of samendrukken.',
                    acceptReject: 'Geringe beschadiging minder dan 5% van het vingeroppervlak: Accepteren met aantekening. Matige beschadiging 5–10%: Afwaarderen. Ernstige beschadiging met zichtbare zachtheid of meerdere aangetaste vingers: Afkeuren.',
                    prevention: 'Behandel alle dozen zorgvuldig in elk stadium. Nooit laten vallen van hoogten boven 30cm. Stapel niet hoger dan aanbevolen dooshoogte. Gebruik gevoerde transportbanden en apparatuur. Oogst op het juiste rijpingstadium.',
                }
            },
            {
                id: 'b-skin-abrasion',
                severity: 'minor',
                emoji: '🟡',
                images: [
                    'images/defects/banana-abrasion-1.jpg',
                ],
                en: {
                    name: 'Skin Abrasions',
                    shortDesc: 'Brown to black scuffing marks on the peel',
                    whatIsIt: 'Skin abrasions result from the banana peel rubbing or scraping against other fruit, surfaces of handling equipment, or the inside of shipping boxes. The outer cells of the peel are damaged, exposing the tissue beneath to oxidation and rapid browning.',
                    howToIdentify: 'Flat, discoloured areas on the skin ranging from light brown to black. The affected area feels rougher than the surrounding skin. In early stages appears as a dull grey patch. Can cover large areas of the skin if fruit moves excessively in the box during transit.',
                    causes: 'Excessive fruit movement within boxes during transit. Contact with rough surfaces of conveyor belts or packing equipment. Overfilling of boxes causing constant friction between fingers. Harvesting with long fingernails or sharp tools that scratch the skin.',
                    shipmentImpact: 'Mainly cosmetic but creates entry points for decay fungi. Under low humidity (below 90% RH) the damaged cells dry out rapidly and turn black. Significantly reduces marketability and retail appearance of the fruit.',
                    temperatureEffects: 'Low relative humidity accelerates browning of abraded areas. Maintain above 90% RH during storage and transport to minimise further discolouration of damaged areas.',
                    acceptReject: 'Light abrasions covering less than 5% of finger: Accept. Moderate 5–15%: Accept for processing, downgrade for retail. Severe over 15% or black discolouration: Reject for fresh retail.',
                    prevention: 'Line boxes with soft padding material. Avoid overfilling boxes. Ensure conveyor belts are smooth and clean. Minimise unnecessary movement and vibration of fruit during transport.',
                },
                nl: {
                    name: 'Schuurwonden',
                    shortDesc: 'Bruin tot zwarte schuursporen op de schil',
                    whatIsIt: 'Schuurwonden ontstaan doordat de bananenschil schuurt langs andere vruchten, oppervlakken van apparatuur of de binnenkant van verzenddozen. De buitenste cellen raken beschadigd, waardoor het onderliggende weefsel wordt blootgesteld aan oxidatie en snelle bruinkleuring.',
                    howToIdentify: 'Platte, verkleurde gebieden op de schil variërend van lichtbruin tot zwart. Het aangetaste gebied voelt ruwer aan dan de omliggende schil. In vroege stadia verschijnt als een dof grijs vlak. Kan grote gebieden bedekken als fruit overmatig beweegt in de doos tijdens transport.',
                    causes: 'Overmatige fruitbeweging in dozen tijdens transport. Contact met ruwe oppervlakken van transportbanden of verpakkingsapparatuur. Overvulling van dozen waardoor constante wrijving ontstaat tussen vingers. Oogsten met lange nagels of scherpe gereedschappen.',
                    shipmentImpact: 'Voornamelijk cosmetisch maar creëert ingangen voor rotschimmels. Bij lage luchtvochtigheid (onder 90% RV) drogen beschadigde cellen snel uit en worden zwart. Vermindert significant de verkoopbaarheid en uitstraling van het fruit.',
                    temperatureEffects: 'Lage relatieve luchtvochtigheid versnelt bruinkleuring van beschadigde gebieden. Handhaaf boven 90% RV tijdens opslag en transport om verdere verkleuring te minimaliseren.',
                    acceptReject: 'Lichte schuurwonden minder dan 5% van de vinger: Accepteren. Matige 5–15%: Accepteren voor verwerking, afwaarderen voor detailhandel. Ernstig over 15% of zwarte verkleuring: Afkeuren voor vers retail.',
                    prevention: 'Bekleed dozen met zacht dempingsmateriaal. Vermijd overvulling van dozen. Zorg dat transportbanden glad en schoon zijn. Minimaliseer onnodige beweging en trillingen van fruit tijdens transport.',
                }
            },
            {
                id: 'b-chilling-injury',
                severity: 'critical',
                emoji: '🔵',
                images: [
                    'images/defects/banana-chilling-1.jpg',
                    'images/defects/banana-chilling-2.jpg',
                ],
                en: {
                    name: 'Chilling Injury',
                    shortDesc: 'Dull grey-yellow skin, streaks, failure to ripen',
                    whatIsIt: 'Chilling injury is a physiological disorder caused by exposing bananas to temperatures below 13°C (56°F). The cold disrupts cell membranes and metabolic processes, causing irreversible cellular damage. Unlike freezing damage it occurs at temperatures well above 0°C and cannot be reversed once it has occurred.',
                    howToIdentify: 'Skin turns dull, smoky grey or greyish-yellow during ripening instead of bright yellow. Dark brown subepidermal streaks are visible when the skin is cut open. In severe cases the fruit completely fails to ripen and remains hard. Brown vascular bundles are visible under the skin. Skin may feel normal but the flesh never softens properly.',
                    causes: 'Storage or transit temperatures below 13°C. Accidental exposure to refrigeration units designed for other produce. Poor temperature management in reefer containers. Fruit loaded near cooling vents in containers.',
                    shipmentImpact: 'Severely affected fruit will not ripen and becomes commercially worthless. Even mildly chilled fruit ripens unevenly. Creates entry points for secondary fungal infections. Losses can reach 100% of the shipment in severe cases.',
                    temperatureEffects: 'Critical threshold is 13°C (56°F). Moderate injury from 1 hour at 10°C, 5 hours at 11.7°C, or 24 hours at 12.2°C. Damage is cumulative and irreversible. Chilled fruit is also significantly more susceptible to bruising and mechanical damage.',
                    acceptReject: 'Any visible chilling injury symptoms: Reject for retail. Mild symptoms with less than 10% affected fingers: Processing use only. Severe symptoms, failure to ripen, or widespread streaking: Full rejection of entire pallet.',
                    prevention: 'Never store below 13°C. Monitor reefer container temperatures continuously. Keep fruit away from cooling vents. Check temperature loggers on arrival. Never mix bananas with cold-chain produce in the same space.',
                },
                nl: {
                    name: 'Kouschade',
                    shortDesc: 'Dof grijs-gele schil, strepen, niet kunnen rijpen',
                    whatIsIt: 'Kouschade is een fysiologische aandoening veroorzaakt door blootstelling van bananen aan temperaturen onder 13°C. De kou verstoort celmembranen en metabolische processen, wat onomkeerbare cellulaire schade veroorzaakt. In tegenstelling tot vrieschade treedt het op bij temperaturen ruim boven 0°C en kan het niet worden omgekeerd zodra het is opgetreden.',
                    howToIdentify: 'Schil wordt dof, rookgrijs of grijsgeel tijdens rijping in plaats van helder geel. Donkerbruine subepidermale strepen zijn zichtbaar wanneer de schil wordt opengesneden. In ernstige gevallen rijpt het fruit helemaal niet en blijft het hard. Bruine vaatbundels zijn zichtbaar onder de schil.',
                    causes: 'Opslag- of transporttemperaturen onder 13°C. Onbedoelde blootstelling aan koeleenheden. Slecht temperatuurbeheer in koelcontainers. Fruit geladen nabij koelventilatoren in containers.',
                    shipmentImpact: 'Zwaar aangetast fruit rijpt niet en wordt commercieel waardeloos. Zelfs licht gekoeld fruit rijpt ongelijkmatig. Creëert ingangen voor secundaire schimmelinfecties. Verliezen kunnen 100% bereiken bij ernstige gevallen.',
                    temperatureEffects: 'Kritieke drempel is 13°C. Matige schade na 1 uur bij 10°C, 5 uur bij 11,7°C, of 24 uur bij 12,2°C. Schade is cumulatief en onomkeerbaar. Gekoeld fruit is ook significant vatbaarder voor kneuzing.',
                    acceptReject: 'Zichtbare kouschade symptomen: Afkeuren voor detailhandel. Milde symptomen minder dan 10% aangetaste vingers: Alleen verwerkingsgebruik. Ernstige symptomen of niet kunnen rijpen: Volledig palet afkeuren.',
                    prevention: 'Nooit bewaren onder 13°C. Bewaak koelcontainertemperaturen continu. Houd fruit weg van koelventilatoren. Controleer temperatuurloggers bij aankomst. Nooit bananen mengen met koudeketenproducten.',
                }
            },
            {
                id: 'b-latex-staining',
                severity: 'minor',
                emoji: '⚫',
                images: [
                    'images/defects/banana-latex-1.jpg',
                ],
                en: {
                    name: 'Latex Staining',
                    shortDesc: 'Milky sap stains that turn dark brown to black',
                    whatIsIt: 'Latex staining occurs when the milky white sap (latex) that flows naturally from cut stems or damaged peel contacts the fruit surface and dries. The latex oxidises on contact with air and turns dark brown to black, leaving permanent cosmetic stains that cannot be removed.',
                    howToIdentify: 'Irregular dark brown or black stains on the skin, often near the crown or tip where cuts are made during dehanding. May have a streaked or dripped pattern. The stain is completely superficial — it does not penetrate the flesh and has no effect on taste.',
                    causes: 'Improper dehanding technique with cuts too close to the crown. Latex dripping from the bunch stem onto lower fruit hands. Delay between dehanding and washing the fruit. Insufficient water flow in the packing tank to dilute and wash away latex.',
                    shipmentImpact: 'Purely cosmetic — does not affect eating quality, safety or shelf life. However significantly reduces retail appearance and can result in rejection by quality-conscious buyers and supermarket chains.',
                    temperatureEffects: 'Latex dries faster in warm, dry conditions making stains harder to remove if the fruit is not washed immediately after dehanding.',
                    acceptReject: 'Staining on less than 5% of finger surface: Accept. Moderate staining 5–20%: Downgrade. Heavy staining over 20% or prominent crown staining: Reject for premium markets.',
                    prevention: 'Dehand bunches immediately over water tanks to capture dripping latex. Use correct dehanding knives with controlled cut distance from crown. Wash fruit immediately after dehanding. Ensure adequate and constant water flow in packing tanks.',
                },
                nl: {
                    name: 'Latexvlekken',
                    shortDesc: 'Melkachtig sapvlekken die donkerbruin tot zwart worden',
                    whatIsIt: 'Latexvlekken ontstaan wanneer het melkwitte sap (latex) dat van nature stroomt uit gesneden stelen of beschadigde schil het vruchtoppervlak raakt en droogt. De latex oxideert bij contact met lucht en wordt donkerbruin tot zwart, waardoor permanente cosmetische vlekken achterblijven die niet verwijderd kunnen worden.',
                    howToIdentify: 'Onregelmatige donkerbruine of zwarte vlekken op de schil, vaak nabij de kroon of punt waar sneden worden gemaakt tijdens onthanden. Kunnen een gestreept of gedruppeld patroon hebben. De vlek is volledig oppervlakkig — dringt niet door in het vruchtvlees en heeft geen effect op smaak.',
                    causes: 'Onjuiste onthanden techniek met sneden te dicht bij de kroon. Latex druipt van de trossteel op lagere vruchthanden. Vertraging tussen onthanden en wassen van het fruit. Onvoldoende waterstroming in de verpakkingstank.',
                    shipmentImpact: 'Puur cosmetisch — heeft geen effect op eetkwaliteit, veiligheid of houdbaarheid. Vermindert echter significant de uitstraling in de winkel en kan leiden tot afkeuring door kwaliteitsbewuste kopers en supermarktketens.',
                    temperatureEffects: 'Latex droogt sneller in warme, droge omstandigheden waardoor vlekken moeilijker te verwijderen zijn als het fruit niet onmiddellijk na onthanden wordt gewassen.',
                    acceptReject: 'Vlekken op minder dan 5% van het vingeroppervlak: Accepteren. Matige vlekken 5–20%: Afwaarderen. Zware vlekken over 20% of prominente kroonvlekken: Afkeuren voor premium markten.',
                    prevention: 'Onthanden trossen onmiddellijk boven watertanks om druipende latex op te vangen. Gebruik correcte onthanden messen met gecontroleerde snijafstand van kroon. Was fruit onmiddellijk na onthanden. Zorg voor voldoende waterstroming in verpakkingstanks.',
                }
            },
            {
                id: 'b-crown-rot',
                severity: 'critical',
                emoji: '🍄',
                images: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Banana-_Anthracnose%2C_crown_rot_and_sugarcane_bud_moth_injury.jpg/640px-Banana-_Anthracnose%2C_crown_rot_and_sugarcane_bud_moth_injury.jpg',
                    'images/defects/banana-crown-rot-1.jpg',
                ],
                en: {
                    name: 'Crown Rot',
                    shortDesc: 'Black soft rot at the crown, fingers detach',
                    whatIsIt: 'Crown rot is the most economically significant postharvest disease of bananas worldwide. It is caused by a complex of fungi — primarily Colletotrichum musae and Fusarium species — that infect the crown tissue where fingers attach to the hand. Infection begins at harvest but symptoms develop during shipping and ripening. Losses from 10–86% have been recorded in untreated bananas.',
                    howToIdentify: 'Soft, dark brown to black rot at the crown area where fingers are joined. White, grey or pink fungal mycelium visible on the crown surface in early stages. The rot progresses from the crown down the peduncles toward individual fingers. In severe cases fingers detach from the crown prematurely. Internal examination shows soft, discoloured tissue extending from the crown.',
                    causes: 'Fungal spores present on cut surfaces during dehanding. Contaminated water in packing tanks. Infected floral remnants left on the crown. Poor sanitation in packing facilities. Temperatures above 15°C dramatically accelerate fungal growth. Bruising and wounds increase susceptibility.',
                    shipmentImpact: 'Major cause of postharvest losses globally. Untreated bananas can suffer 10–86% loss rates. Infected crowns cause premature and uneven ripening of individual fingers. Severely infected fruit is commercially worthless. Disease spreads rapidly in warm conditions during shipping.',
                    temperatureEffects: 'Temperature above 15°C accelerates fungal growth dramatically. Prompt cooling to 14°C after packing is critical to slow progression. Maintaining 13–14°C during transit significantly limits disease development. Temperature fluctuations causing condensation on the crown must be avoided at all times.',
                    acceptReject: 'Any visible crown rot symptoms on retail fruit: Reject immediately. Mild surface mycelium with no tissue damage: Quarantine and monitor closely. Soft crown tissue or finger detachment: Full rejection. Check entire pallet if crown rot found on any single box.',
                    prevention: 'Hot water treatment (50°C for 5 minutes) after dehanding. Fungicide treatment (Imazalil or Thiabendazole) at packing station. Immediate cooling to 14°C after packing. Daily cleaning and sanitising of all packing equipment and water tanks. Minimise bruising throughout the process. Remove all floral remnants before packing.',
                },
                nl: {
                    name: 'Kroonrot',
                    shortDesc: 'Zwart zacht rot bij de kroon, vingers lossen los',
                    whatIsIt: 'Kroonrot is de meest economisch significante post-oogst ziekte van bananen wereldwijd. Het wordt veroorzaakt door een complex van schimmels — voornamelijk Colletotrichum musae en Fusarium soorten — die het kroonweefsel infecteren waar vingers bevestigd zijn aan de hand. Infectie begint bij de oogst maar symptomen ontwikkelen zich tijdens verzending en rijping. Verliezen van 10–86% zijn geregistreerd bij onbehandelde bananen.',
                    howToIdentify: 'Zacht, donkerbruin tot zwart rot bij het kroongebied waar vingers zijn samengevoegd. Wit, grijs of roze schimmelmycelium zichtbaar op het kroonoppervlak in vroege stadia. Het rot vordert van de kroon langs de stelen naar afzonderlijke vingers. In ernstige gevallen lossen vingers vroegtijdig los. Intern onderzoek toont zacht, verkleurd weefsel vanuit de kroon.',
                    causes: 'Schimmelsporen op gesneden oppervlakken tijdens onthanden. Verontreinigd water in verpakkingstanks. Geïnfecteerde bloemresten achtergelaten op de kroon. Slechte sanitaire voorzieningen. Temperaturen boven 15°C versnellen schimmelgroei dramatisch. Kneuzing en wonden verhogen vatbaarheid.',
                    shipmentImpact: 'Grootste oorzaak van post-oogst verliezen wereldwijd. Onbehandelde bananen kunnen 10–86% verliespercentages lijden. Geïnfecteerde kronen veroorzaken vroegtijdige en ongelijkmatige rijping. Zwaar geïnfecteerd fruit is commercieel waardeloos.',
                    temperatureEffects: 'Temperatuur boven 15°C versnelt schimmelgroei dramatisch. Snelle koeling tot 14°C na verpakking is essentieel. Handhaven van 13–14°C tijdens transport beperkt ziekteprogressie significant. Temperatuurschommelingen die condensatie op de kroon veroorzaken moeten te allen tijde worden vermeden.',
                    acceptReject: 'Zichtbare kroonrot symptomen op retailfruit: Onmiddellijk afkeuren. Mild oppervlaktemycelium zonder weefselschade: Quarantaine en nauwlettend monitoren. Zacht kroonweefsel of vingeronthechting: Volledige afkeuring. Controleer het hele palet als kroonrot op een enkele doos wordt gevonden.',
                    prevention: 'Warmwaterbehandeling (50°C gedurende 5 minuten) na onthanden. Fungicidebehandeling (Imazalil of Thiabendazool) bij verpakkingsstation. Onmiddellijke koeling tot 14°C na verpakking. Dagelijkse reiniging en desinfectie van alle verpakkingsapparatuur en watertanks. Minimaliseer kneuzing door het hele proces. Verwijder alle bloemdelen voor verpakking.',
                }
            },
            {
                id: 'b-anthracnose',
                severity: 'major',
                emoji: '🔴',
                images: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Banana-_Prob._anthracnose_-_15774886919.jpg/640px-Banana-_Prob._anthracnose_-_15774886919.jpg',
                    'images/defects/banana-anthracnose-1.jpg',
                ],
                en: {
                    name: 'Anthracnose',
                    shortDesc: 'Black sunken spots appearing as fruit ripens',
                    whatIsIt: 'Anthracnose is a fungal disease caused primarily by Colletotrichum musae. The fungus infects green fruit in the field but remains completely latent (dormant) and invisible until the fruit begins to ripen. When ripening triggers ethylene production, the dormant fungus activates and visible black lesions appear rapidly on the skin.',
                    howToIdentify: 'Black or dark brown, sunken circular or irregular spots of varying sizes on the ripening skin. Spots may have angular or triangular edges. In advanced stages spots merge into large irregular patches. Salmon-coloured spore masses may be visible in high humidity conditions. Lesions appear during and after ripening — not on fully green fruit. Cannot be detected by visual inspection on green fruit.',
                    causes: 'Field infection from C. musae spores on flowers and plant debris during fruit development. Spores spread by rain or insects onto developing fruit bunches. The infection is completely latent and invisible on green fruit. Warm, humid conditions in the field favour heavy spore production.',
                    shipmentImpact: 'Lesions appear during and after ripening, reducing retail quality dramatically. Can trigger premature ripening similar to crown rot. Post-ripening losses in severely affected boxes can reach 30–50%. Impossible to detect on green fruit during standard visual inspection at loading.',
                    temperatureEffects: 'Latent infection is triggered by the ripening process and ethylene exposure. Keeping fruit green and below 14°C delays symptom expression. Once ripening begins, symptoms develop rapidly at any temperature. Cold storage delays but does not eliminate the disease.',
                    acceptReject: 'Green fruit with no visible symptoms: Must accept as cannot be detected. Ripened fruit with spots covering less than 10% of surface: Downgrade. Spots covering more than 10% or merging into large patches: Reject. Salmon-coloured spore masses visible: Reject immediately.',
                    prevention: 'Preharvest fungicide applications in the field reduce spore levels. Post-harvest fungicide (Thiabendazole) treatment at packing. Minimise physical damage that can activate latent infections. Rapid market distribution after ripening to minimise symptom development.',
                },
                nl: {
                    name: 'Antracnose',
                    shortDesc: 'Zwarte verzonken vlekken verschijnen bij rijping',
                    whatIsIt: 'Antracnose is een schimmelziekte veroorzaakt voornamelijk door Colletotrichum musae. De schimmel infecteert groen fruit op het veld maar blijft volledig latent (slapend) en onzichtbaar totdat het fruit begint te rijpen. Wanneer rijping ethyleenproductie triggert, activeert de slapende schimmel en verschijnen zichtbare zwarte letsels snel op de schil.',
                    howToIdentify: 'Zwarte of donkerbruine, verzonken cirkelvormige of onregelmatige vlekken op de rijpende schil. Vlekken kunnen hoekige of driehoekige randen hebben. In gevorderde stadia smelten vlekken samen. Zalm-gekleurde sporenmassa\'s kunnen zichtbaar zijn bij hoge luchtvochtigheid. Letsels verschijnen tijdens en na rijping — niet op volledig groen fruit.',
                    causes: 'Veldbesmetting van C. musae sporen op bloemen en plantenresten tijdens vruchtontwikkeling. Sporen verspreid door regen of insecten. De infectie is volledig latent en onzichtbaar op groen fruit. Warme, vochtige omstandigheden bevorderen zware sporenproductie.',
                    shipmentImpact: 'Letsels verschijnen tijdens en na rijping, waardoor detailhandelskwaliteit drastisch afneemt. Kan vroegtijdige rijping triggeren. Post-rijping verliezen kunnen 30–50% bereiken. Onmogelijk te detecteren op groen fruit tijdens standaard visuele inspectie bij laden.',
                    temperatureEffects: 'Latente infectie wordt getriggerd door het rijpingsproces en ethyleenblootstelling. Fruit groen houden en onder 14°C vertraagt symptoomexpressie. Zodra rijping begint, ontwikkelen symptomen zich snel bij elke temperatuur.',
                    acceptReject: 'Groen fruit zonder zichtbare symptomen: Moet accepteren want kan niet worden gedetecteerd. Gerijpt fruit met vlekken minder dan 10%: Afwaarderen. Vlekken meer dan 10% of samensmeltend: Afkeuren. Zichtbare zalm-gekleurde sporenmassa\'s: Onmiddellijk afkeuren.',
                    prevention: 'Pre-oogst fungicideapplicaties op het veld verminderen sporeniveaus. Post-oogst fungicide (Thiabendazool) bij verpakking. Minimaliseer fysieke schade. Snelle marktverdeling na rijping om symptoomontwikkeling te minimaliseren.',
                }
            },
        ],
        internal: [
            {
                id: 'b-flesh-browning',
                severity: 'major',
                emoji: '🟫',
                images: [
                    'images/defects/banana-flesh-browning-1.jpg',
                ],
                en: {
                    name: 'Internal Flesh Browning',
                    shortDesc: 'Brown flesh not visible from outside',
                    whatIsIt: 'Internal flesh browning is a physiological disorder where the banana pulp develops brown or grey discolouration without any visible external symptoms. It can result from overripeness, chilling injury, enzymatic oxidation, or CO2 injury. The flesh loses its normal cream-white colour and quality.',
                    howToIdentify: 'Only visible when fruit is cut open. Brown, grey or pink discolouration of the flesh, often radiating outward from the core. Texture may be mushy or watery in severely affected areas. Odour may be fermented or off. External appearance is completely normal making it impossible to detect without cutting.',
                    causes: 'Advanced overripeness. Secondary effect of chilling injury. Enzymatic browning from damaged cell walls. Carbon dioxide injury from improper controlled atmosphere storage. Ethylene overexposure during artificial ripening in ripening rooms.',
                    shipmentImpact: 'Completely invisible during standard inspection of intact fruit. Discovered only at retail or consumer level. Major cause of consumer complaints and product returns. Cannot be sorted or detected without cutting each individual fruit.',
                    temperatureEffects: 'Temperatures below 13°C can cause chilling injury leading to internal browning. Very high temperatures accelerate overripeness-related browning. Optimal storage at 13–14°C minimises risk significantly.',
                    acceptReject: 'Random cut sampling recommended for any suspicious lots. Internal browning in more than 5% of sampled fruit: Reject entire lot. Brown discolouration only near the core: Downgrade with disclosure to buyer. Widespread browning throughout flesh: Full rejection.',
                    prevention: 'Maintain proper cold chain temperatures above 13°C at all stages. Never overripen in ripening rooms beyond target colour. Monitor CO2 levels in controlled atmosphere storage. Dispatch fruit promptly after ripening to market. Avoid ethylene overexposure.',
                },
                nl: {
                    name: 'Interne Bruinkleuring',
                    shortDesc: 'Bruin vruchtvlees niet zichtbaar van buiten',
                    whatIsIt: 'Interne bruinkleuring is een fysiologische aandoening waarbij het bananenvruchtvlees bruine of grijze verkleuring ontwikkelt zonder zichtbare externe symptomen. Het kan het gevolg zijn van overrijpheid, kouschade, enzymatische oxidatie of CO2-schade. Het vruchtvlees verliest zijn normale crème-witte kleur en kwaliteit.',
                    howToIdentify: 'Alleen zichtbaar wanneer fruit wordt opengesneden. Bruin, grijs of roze verkleuring van het vruchtvlees, vaak uitstralend vanuit de kern. Textuur kan moes of waterig zijn in ernstig aangetaste gebieden. Geur kan gefermenteerd of afwijkend zijn. Extern uiterlijk is volledig normaal.',
                    causes: 'Gevorderde overrijpheid. Secundair effect van kouschade. Enzymatische bruinkleuring van beschadigde celwanden. Koolstofdioxideschade door onjuiste gecontroleerde atmosferische opslag. Ethyleenoverblootstelling tijdens kunstmatige rijping in rijpkamers.',
                    shipmentImpact: 'Volledig onzichtbaar tijdens standaard inspectie van intact fruit. Ontdekt alleen op retail- of consumentenniveau. Grote oorzaak van consumentenklachten en productretouren. Kan niet worden gesorteerd of gedetecteerd zonder elk afzonderlijk stuk fruit te snijden.',
                    temperatureEffects: 'Temperaturen onder 13°C kunnen kouschade veroorzaken die leidt tot interne bruinkleuring. Zeer hoge temperaturen versnellen overrijpheid-gerelateerde bruinkleuring. Optimale opslag bij 13–14°C minimaliseert het risico significant.',
                    acceptReject: 'Willekeurige snijbemonstering aanbevolen voor verdachte partijen. Interne bruinkleuring in meer dan 5% van bemonsterd fruit: Volledige partij afkeuren. Bruine verkleuring alleen nabij kern: Afwaarderen met openbaarmaking aan koper. Wijdverspreide bruinkleuring: Volledige afkeuring.',
                    prevention: 'Handhaaf correcte koelketen temperaturen boven 13°C in alle stadia. Nooit overrijpen in rijpkamers voorbij doelkleur. Bewaak CO2-niveaus bij gecontroleerde atmosferische opslag. Verzend fruit snel na rijping naar de markt. Vermijd ethyleenoverblootstelling.',
                }
            },
            {
                id: 'b-vascular-browning',
                severity: 'major',
                emoji: '🩸',
                images: [
                    'images/defects/banana-vascular-1.jpg',
                ],
                en: {
                    name: 'Vascular Browning',
                    shortDesc: 'Dark brown streaks along the vascular bundles',
                    whatIsIt: 'Vascular browning appears as dark brown or black discolouration along the vascular bundles — the string-like structures that run lengthwise through the banana flesh. It is most commonly associated with chilling injury but can also result from fungal invasion progressing from crown rot.',
                    howToIdentify: 'Visible as dark brown to black streaks running lengthwise when the banana is cut open. The streaks follow the vascular bundle pattern. Can sometimes be seen through the skin as faint dark lines below the peel surface. Associated with fruit that fails to ripen normally or ripens with dull colouration.',
                    causes: 'Chilling injury — the most common cause. Sub-optimal cold chain management below 13°C. Fusarium wilt infection from growing region. Fungal invasion progressing from crown rot down the peduncle into the flesh.',
                    shipmentImpact: 'Fruit with vascular browning often ripens abnormally and unevenly. Associated with poor eating quality and off-flavours. Signals potential underlying disease or cold chain failure requiring investigation. Can indicate entire pallet problems in chilling injury cases.',
                    temperatureEffects: 'Directly linked to chilling injury below 13°C. The vascular tissue is particularly sensitive to cold temperatures. Symptoms may not be visible until fruit begins to ripen at higher temperatures.',
                    acceptReject: 'Vascular browning visible on cut sample: Flag for investigation immediately. Browning in less than 20% of vascular bundles: Downgrade. Browning in more than 20% or widespread: Reject. If linked to confirmed chilling injury: Reject entire pallet.',
                    prevention: 'Strict cold chain management above 13°C at all times throughout the supply chain. Continuous temperature monitoring during transit. Do not load bananas in reefers below 13°C. Investigate the source farm if widespread vascular browning is found.',
                },
                nl: {
                    name: 'Vasculaire Bruinkleuring',
                    shortDesc: 'Donkerbruine strepen langs de vaatbundels',
                    whatIsIt: 'Vasculaire bruinkleuring verschijnt als donkerbruine of zwarte verkleuring langs de vaatbundels — de draadachtige structuren die lengterichting door het bananenvruchtvlees lopen. Het is het meest geassocieerd met kouschade maar kan ook het gevolg zijn van schimmelinvasie vanuit kroonrot.',
                    howToIdentify: 'Zichtbaar als donkerbruine tot zwarte strepen die lengterichting lopen wanneer de banaan wordt opengesneden. De strepen volgen het vaatbundelpatroon. Soms zichtbaar door de schil als vage donkere lijnen. Geassocieerd met fruit dat niet normaal rijpt of rijpt met doffe kleuring.',
                    causes: 'Kouschade — de meest voorkomende oorzaak. Suboptimaal koelketen beheer onder 13°C. Fusarium-verwelkingsinfectie uit het groeigebied. Schimmelinvasie die vordert vanuit kroonrot langs de steel het vruchtvlees in.',
                    shipmentImpact: 'Fruit met vasculaire bruinkleuring rijpt vaak abnormaal en ongelijkmatig. Geassocieerd met slechte eetkwaliteit en afwijkende smaken. Signaleert potentiële onderliggende ziekte of koelketen falen. Kan problemen met het hele palet aangeven bij kouschadegevallen.',
                    temperatureEffects: 'Direct gekoppeld aan kouschade onder 13°C. Het vasculaire weefsel is bijzonder gevoelig voor lage temperaturen. Symptomen zijn mogelijk pas zichtbaar wanneer fruit begint te rijpen bij hogere temperaturen.',
                    acceptReject: 'Vasculaire bruinkleuring zichtbaar bij snijmonster: Onmiddellijk markeren voor onderzoek. Bruinkleuring in minder dan 20% van vaatbundels: Afwaarderen. Meer dan 20% of wijdverspreid: Afkeuren. Gekoppeld aan bevestigde kouschade: Volledig palet afkeuren.',
                    prevention: 'Strikt koelketen beheer boven 13°C te allen tijde in de hele keten. Continue temperatuurbewaking tijdens transport. Bananen niet laden in koelcontainers onder 13°C. Onderzoek het bronbedrijf als wijdverspreide vasculaire bruinkleuring wordt gevonden.',
                }
            },
            {
                id: 'b-finger-drop',
                severity: 'major',
                emoji: '🍌',
                images: [
                    'images/defects/banana-finger-drop-1.jpg',
                ],
                en: {
                    name: 'Finger Drop',
                    shortDesc: 'Fingers detach prematurely from the crown',
                    whatIsIt: 'Finger drop is the premature detachment of individual banana fingers from the crown (hand). The pedicel — the short stalk connecting each finger to the crown — weakens and breaks, causing fingers to fall off. It can occur at packing, during transit, or at retail level.',
                    howToIdentify: 'Individual fingers separated completely from the crown. A clean circular scar visible at the detachment point on both the crown and the detached finger. In early stages fingers are still attached but very loose and pull off with minimal force. More common in overripe fruit at Color 5–6.',
                    causes: 'Overripeness — as fruit ripens the pedicel weakens significantly. Crown rot infection weakening the crown tissue. Rough handling causing physical detachment. Harvesting at too mature a stage. Ethylene overexposure during ripening accelerating the process.',
                    shipmentImpact: 'Detached fingers have significantly reduced shelf life and poor retail appeal. A hand with missing fingers is commercially downgraded automatically. Detached fingers bruise easily and rot very rapidly. Major cause of quality complaints and rejection at retail level.',
                    temperatureEffects: 'Warm temperatures and advanced ripening dramatically increase finger drop incidence. Maintaining fruit at the correct ripening stage minimises risk. Overripe fruit at Color 5–6 is most susceptible.',
                    acceptReject: 'One detached finger per hand: Downgrade. More than one detached finger: Reject hand and redirect to processing. Hands with loose fingers that pull off easily: Downgrade for immediate sale only. Entire box with widespread finger drop: Reject.',
                    prevention: 'Harvest at correct maturity (Color 1–2). Avoid overripening in ripening rooms. Minimise rough handling of ripe fruit at all stages. Do not pack or dispatch fruit with crown rot. Ensure timely delivery to market after ripening.',
                },
                nl: {
                    name: 'Vingerval',
                    shortDesc: 'Vingers lossen vroegtijdig los van de kroon',
                    whatIsIt: 'Vingerval is het vroegtijdig losmaken van afzonderlijke bananenvingers van de kroon (hand). De steel — de korte stengel die elke vinger verbindt met de kroon — verzwakt en breekt, waardoor vingers loslaten. Het kan optreden bij verpakking, tijdens transport of op retailniveau.',
                    howToIdentify: 'Afzonderlijke vingers volledig gescheiden van de kroon. Een schoon cirkelvormig litteken zichtbaar op het losmaakpunt op zowel de kroon als de losgemaakte vinger. In vroege stadia zijn vingers nog bevestigd maar zeer los en lossen af met minimale kracht. Vaker bij overrijp fruit op Kleur 5–6.',
                    causes: 'Overrijpheid — naarmate fruit rijpt verzwakt de steel significant. Kroonrotinfectie die het kroonweefsel verzwakt. Ruw behandelen dat fysieke onthechting veroorzaakt. Oogsten in een te rijp stadium. Ethyleenoverblootstelling tijdens rijping.',
                    shipmentImpact: 'Losgeraakte vingers hebben aanzienlijk verminderde houdbaarheid en slechte retailaantrekkingskracht. Een hand met ontbrekende vingers wordt automatisch commercieel afgewaardeerd. Losgeraakte vingers kneuzen gemakkelijk en rotten zeer snel. Grote oorzaak van kwaliteitsklachten op retailniveau.',
                    temperatureEffects: 'Warme temperaturen en gevorderde rijping verhogen de incidentie van vingerval dramatisch. Handhaven van fruit op het correcte rijpingsstadium minimaliseert risico. Overrijp fruit op Kleur 5–6 is het meest vatbaar.',
                    acceptReject: 'Één losgeraakte vinger per hand: Afwaarderen. Meer dan één losgeraakte vinger: Hand afkeuren en doorsturen naar verwerking. Handen met losse vingers die gemakkelijk losraken: Afwaarderen voor onmiddellijke verkoop. Hele doos met wijdverspreide vingerval: Afkeuren.',
                    prevention: 'Oogsten op correct rijpingstadium (Kleur 1–2). Vermijd overrijpen in rijpkamers. Minimaliseer ruw behandelen van rijp fruit in alle stadia. Geen fruit met kroonrot verpakken of verzenden. Zorg voor tijdige levering aan de markt na rijping.',
                }
            },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // MANGO
    // ═══════════════════════════════════════════════════════════
    mango: {
        external: [
            {
                id: 'm-anthracnose',
                severity: 'critical',
                emoji: '⚫',
                images: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Mango_Anthracnose.jpg/640px-Mango_Anthracnose.jpg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Mango_ripe_with_anthracnose.jpg/640px-Mango_ripe_with_anthracnose.jpg',
                    'images/defects/mango-anthracnose-1.jpg',
                ],
                en: {
                    name: 'Anthracnose',
                    shortDesc: 'Black sunken spots, spreads rapidly on ripening skin',
                    whatIsIt: 'Anthracnose is the most economically important postharvest disease of mango worldwide, caused by the fungus Colletotrichum gloeosporioides. Like in bananas, the infection is latent — the fruit is infected in the field while still green but shows no symptoms until ripening begins. Estimated yield losses range from 20–100% in unmanaged conditions.',
                    howToIdentify: 'Dark brown to black, slightly sunken, circular or irregular spots on the skin of ripening fruit. Spots start small (2–5mm) and expand rapidly, sometimes merging to cover the entire surface. In wet conditions, orange-pink spore masses appear in the centres of lesions. The "alligator skin" or cracked texture pattern is a classic identification sign on severely affected fruit.',
                    causes: 'Field infection from C. gloeosporioides spores on flowers, twigs and leaves during fruit development. Rain and humid conditions spread spores extensively. The infection remains completely dormant until ripening is triggered. Hot, humid tropical growing conditions maximise disease pressure.',
                    shipmentImpact: 'Lesions develop during and after ripening — the disease progresses rapidly at room temperature. Can render entire consignments commercially worthless within 2–3 days of ripening. A major cause of rejection at European and international import inspection points.',
                    temperatureEffects: 'Disease development is dramatically slowed by cold storage at 10–13°C. However the infection cannot be eliminated by cold alone. Once fruit is warmed for ripening, symptoms develop rapidly. Heat treatment (hot water dip at 52°C for 5 min) is proven to reduce latent infection before storage.',
                    acceptReject: 'Green fruit with no visible symptoms: Accept with standard fungicide treatment. Ripened fruit with spots covering less than 5% of surface: Minor downgrade. Spots covering more than 5% or with spore masses: Reject. Extensive coalescent lesions: Reject, isolate from other boxes.',
                    prevention: 'Pre-harvest field fungicide programme. Hot water dip (52°C for 5 minutes) immediately after harvest. Post-harvest fungicide (Prochloraz or Thiabendazole). Cold storage at 10–13°C. Harvest at correct maturity (not too ripe). Avoid skin damage during harvest and packing.',
                },
                nl: {
                    name: 'Antracnose',
                    shortDesc: 'Zwarte verzonken vlekken, verspreidt snel op rijpende schil',
                    whatIsIt: 'Antracnose is de meest economisch belangrijke post-oogst ziekte van mango wereldwijd, veroorzaakt door de schimmel Colletotrichum gloeosporioides. Net als bij bananen is de infectie latent — het fruit wordt geïnfecteerd op het veld terwijl het nog groen is maar toont geen symptomen totdat rijping begint. Geschatte opbrengstverliezen variëren van 20–100% bij onbeheerde omstandigheden.',
                    howToIdentify: 'Donkerbruin tot zwarte, licht verzonken, cirkelvormige of onregelmatige vlekken op de schil van rijpend fruit. Vlekken beginnen klein (2–5mm) en breiden zich snel uit, soms samensmeltend om het hele oppervlak te bedekken. Bij vochtige omstandigheden verschijnen oranje-roze sporenmassa\'s in de centra van letsels. Het "krokodillenhuid" of gebarsten textuurpatroon is een klassiek identificatieteken op zwaar aangetast fruit.',
                    causes: 'Veldbesmetting van C. gloeosporioides sporen op bloemen, twijgen en bladeren tijdens vruchtontwikkeling. Regen en vochtige omstandigheden verspreiden sporen uitgebreid. De infectie blijft volledig slapend totdat rijping wordt getriggerd.',
                    shipmentImpact: 'Letsels ontwikkelen zich tijdens en na rijping — de ziekte vordert snel bij kamertemperatuur. Kan volledige zendingen commercieel waardeloos maken binnen 2–3 dagen na rijping. Een grote oorzaak van afkeuring bij Europese en internationale invoer-inspectiepunten.',
                    temperatureEffects: 'Ziekteprogressie wordt dramatisch vertraagd door koude opslag bij 10–13°C. De infectie kan echter niet worden geëlimineerd door alleen koude. Zodra fruit wordt opgewarmd voor rijping, ontwikkelen symptomen zich snel. Warmtebehandeling (heet waterbad bij 52°C gedurende 5 min) is bewezen effectief.',
                    acceptReject: 'Groen fruit zonder zichtbare symptomen: Accepteren met standaard fungicidebehandeling. Gerijpt fruit met vlekken minder dan 5% van het oppervlak: Lichte afwaardering. Vlekken meer dan 5% of met sporenmassa\'s: Afkeuren. Uitgebreide samengesmolten letsels: Afkeuren, isoleren van andere dozen.',
                    prevention: 'Pre-oogst veldfungicideprogramma. Heet waterbad (52°C gedurende 5 minuten) direct na oogst. Post-oogst fungicide (Prochloraz of Thiabendazool). Koude opslag bij 10–13°C. Oogsten op correct rijpingstadium. Vermijd huidbeschadiging tijdens oogst en verpakking.',
                }
            },
            {
                id: 'm-stem-end-rot',
                severity: 'critical',
                emoji: '🟫',
                images: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Mango_stem_end_rot.jpg/640px-Mango_stem_end_rot.jpg',
                    'images/defects/mango-stem-end-rot-1.jpg',
                ],
                en: {
                    name: 'Stem End Rot',
                    shortDesc: 'Dark rot spreading from the stem end downward',
                    whatIsIt: 'Stem end rot (SER) is the second most important postharvest disease of mango worldwide. It is caused by a group of fungal pathogens — primarily Lasiodiplodia theobromae, Dothiorella species, and Neofusicoccum species — that colonise the stem end of the fruit. The infection is latent and activates during ripening. Post-harvest losses of 30–40% are common in affected consignments.',
                    howToIdentify: 'Dark brown to black discolouration starting at the stem end (where the stalk was attached) and spreading downward toward the base of the fruit. The affected skin appears sunken or water-soaked at the margins of the lesion. Internal examination shows brown discolouration and softening of the flesh from the stem end. In advanced cases the entire fruit can blacken within days.',
                    causes: 'Fungal pathogens infect the stem tissue before harvest as latent endophytes. Harvesting without leaving a short stem (10–15mm) dramatically increases infection risk. Wounds and mechanical damage at the stem end. Warm temperatures above 20°C accelerate disease development. High humidity favours spore germination.',
                    shipmentImpact: 'Can progress from first visible symptoms to total fruit loss within 24–72 hours at room temperature. Frequently causes major consignment rejections at destination. Especially severe in fruit harvested without stem. The disease is particularly difficult to manage because it is invisible at harvest.',
                    temperatureEffects: 'Cold storage at 10–12°C significantly slows disease development. However once fruit is warmed for ripening, the disease activates rapidly. Rapid cooling after harvest is critical. Temperature above 25°C dramatically accelerates rot progression.',
                    acceptReject: 'Any visible SER at stem end: Reject for fresh retail. Lesion confined to less than 5mm from stem end: Downgrade only if stalk-intact. SER spreading beyond 5mm: Reject. Any evidence of internal browning at stem end: Reject.',
                    prevention: 'Always harvest with a short stem (10–15mm minimum). Rapid cooling after harvest to below 12°C. Fungicide dip (Prochloraz) within 4 hours of harvest. Avoid any damage to the stem end during packing and transport. Hot water treatment (52°C for 5 minutes).',
                },
                nl: {
                    name: 'Stengelrot',
                    shortDesc: 'Donker rot dat zich verspreidt van het stengeluiteinde naar beneden',
                    whatIsIt: 'Stengelrot (SER) is de tweede meest belangrijke post-oogst ziekte van mango wereldwijd. Het wordt veroorzaakt door een groep schimmelziekteverwekkers — voornamelijk Lasiodiplodia theobromae, Dothiorella soorten en Neofusicoccum soorten — die het stengeluiteinde van het fruit koloniseren. De infectie is latent en activeert tijdens rijping. Post-oogst verliezen van 30–40% zijn gebruikelijk.',
                    howToIdentify: 'Donkerbruin tot zwarte verkleuring beginnend bij het stengeluiteinde (waar de steel was bevestigd) en zich naar beneden verspreidend richting de basis van het fruit. De aangetaste schil lijkt verzonken of waterachtig doorweekt bij de randen van het letsel. Intern onderzoek toont bruinkleuring en verzachting van het vruchtvlees vanuit het stengeluiteinde.',
                    causes: 'Schimmelziekteverwekkers infecteren het stengelweefsel voor de oogst als latente endofyten. Oogsten zonder een korte steel (10–15mm) te laten verhoogt infectierisico dramatisch. Wonden en mechanische schade aan het stengeluiteinde. Warme temperaturen boven 20°C versnellen ziekteprogressie.',
                    shipmentImpact: 'Kan van eerste zichtbare symptomen tot totaal vruchtenverlies vorderen binnen 24–72 uur bij kamertemperatuur. Veroorzaakt frequent grote zendingsafkeuringen op bestemming. Bijzonder ernstig bij fruit geoogst zonder steel.',
                    temperatureEffects: 'Koude opslag bij 10–12°C vertraagt ziekteprogressie significant. Zodra fruit wordt opgewarmd voor rijping, activeert de ziekte snel. Snelle koeling na oogst is essentieel. Temperatuur boven 25°C versnelt rotprogressie dramatisch.',
                    acceptReject: 'Zichtbaar SER bij stengeluiteinde: Afkeuren voor vers retail. Letsel beperkt tot minder dan 5mm van stengeluiteinde: Afwaarderen alleen als steel intact. SER zich verspreidend voorbij 5mm: Afkeuren. Bewijs van interne bruinkleuring bij stengeluiteinde: Afkeuren.',
                    prevention: 'Altijd oogsten met een korte steel (minimaal 10–15mm). Snelle koeling na oogst tot onder 12°C. Fungicide dip (Prochloraz) binnen 4 uur na oogst. Vermijd schade aan het stengeluiteinde tijdens verpakking en transport. Warmwaterbehandeling (52°C gedurende 5 minuten).',
                }
            },
            {
                id: 'm-bruising',
                severity: 'major',
                emoji: '🟤',
                images: [
                    'images/defects/mango-bruising-1.jpg',
                    'images/defects/mango-bruising-2.jpg',
                ],
                en: {
                    name: 'Bruising & Impact Damage',
                    shortDesc: 'Brown soft spots from mechanical damage',
                    whatIsIt: 'Bruising in mango occurs when the fruit is subjected to impact, compression or vibration that damages the internal flesh cells without necessarily breaking the skin. The damaged cells oxidise and turn brown, creating soft spots that are visible when the fruit is cut open and often visible on the skin of ripe fruit.',
                    howToIdentify: 'Soft, darkened areas on the skin of ripe or ripening fruit. Brown, water-soaked areas in the flesh when cut. On green fruit bruising may not be visible externally — it appears as the fruit ripens. Bruised areas are surrounded by a darker border. The affected flesh is soft, discoloured and often has an off-flavour.',
                    causes: 'Dropping during harvest from the tree or packing station. Compression in overfilled bins or boxes. Vibration during road transport over rough surfaces. Impact against hard surfaces during sorting and grading. Harvesting with improper tools.',
                    shipmentImpact: 'Bruised areas accelerate decay and create ideal conditions for fungal infection especially anthracnose. Significantly reduces eating quality, appearance and shelf life. Major cause of rejection at retail level and consumer dissatisfaction.',
                    temperatureEffects: 'Fruit stored below the recommended temperature (10°C) becomes more susceptible to bruising damage. Warm fruit is softer and more prone to impact damage. Rapid cooling after harvest reduces susceptibility.',
                    acceptReject: 'Bruised area less than 2% of fruit surface: Accept. Bruised area 2–10%: Downgrade for processing. Bruised area over 10% or multiple impact sites: Reject for fresh market.',
                    prevention: 'Use padded harvesting bags and containers. Avoid dropping fruit. Handle with care at all stages. Ensure adequate padding in packing boxes. Avoid overfilling bins. Use smooth road routes where possible.',
                },
                nl: {
                    name: 'Kneuzing & Stootschade',
                    shortDesc: 'Bruine zachte plekken van mechanische schade',
                    whatIsIt: 'Kneuzing bij mango treedt op wanneer het fruit wordt blootgesteld aan stoot, samendrukking of trillingen die de interne vruchtvleescellen beschadigen zonder noodzakelijkerwijs de schil te breken. De beschadigde cellen oxideren en worden bruin, waardoor zachte plekken ontstaan die zichtbaar zijn wanneer het fruit wordt opengesneden.',
                    howToIdentify: 'Zachte, donkere gebieden op de schil van rijp of rijpend fruit. Bruine, waterachtig doorweekte gebieden in het vruchtvlees bij snijden. Bij groen fruit is kneuzing mogelijk niet extern zichtbaar — het verschijnt naarmate het fruit rijpt. Gekneusd vruchtvlees is zacht, verkleurd en heeft vaak een afwijkende smaak.',
                    causes: 'Vallen tijdens oogst van de boom of verpakkingsstation. Samendrukking in overvol gevulde bakken of dozen. Trillingen tijdens wegtransport over ruwe oppervlakken. Impact tegen harde oppervlakken tijdens sorteren en graderen. Oogsten met onjuist gereedschap.',
                    shipmentImpact: 'Gekneusd vruchtvlees versnelt rot en creëert ideale omstandigheden voor schimmelinfectie met name antracnose. Vermindert significant eetkwaliteit, uitstraling en houdbaarheid. Grote oorzaak van afkeuring op retailniveau.',
                    temperatureEffects: 'Fruit opgeslagen onder de aanbevolen temperatuur (10°C) wordt vatbaarder voor kneuschade. Warm fruit is zachter en vatbaarder voor stootschade. Snelle koeling na oogst vermindert vatbaarheid.',
                    acceptReject: 'Gekneusd gebied minder dan 2% van het vruchtoppervlak: Accepteren. Gekneusd gebied 2–10%: Afwaarderen voor verwerking. Gekneusd gebied over 10% of meerdere impactpunten: Afkeuren voor verse markt.',
                    prevention: 'Gebruik gevoerde oogstbags en containers. Vermijd vallen van fruit. Behandel met zorg in alle stadia. Zorg voor voldoende demping in verpakkingsdozen. Vermijd overvulling van bakken. Gebruik zo mogelijk gladde wegroutes.',
                }
            },
            {
                id: 'm-skin-blemish',
                severity: 'minor',
                emoji: '🟡',
                images: [
                    'images/defects/mango-blemish-1.jpg',
                ],
                en: {
                    name: 'Skin Blemishes & Scab',
                    shortDesc: 'Corky, rough patches or spots on the skin',
                    whatIsIt: 'Skin blemishes on mango include a range of cosmetic defects: scab (caused by the fungus Elsinoe mangiferae), lenticel spotting, and various superficial marks from insect feeding or physical contact. These are predominantly cosmetic issues but can affect marketability significantly in fresh export markets.',
                    howToIdentify: 'Rough, corky, slightly raised patches on the skin — typically light brown to grey. Lenticel spots appear as dark spots around the natural pores of the skin, often becoming more prominent as the fruit ripens. Scab lesions have a distinctive rough, warty texture. These defects do not penetrate the flesh.',
                    causes: 'Scab fungus infection (Elsinoe mangiferae) during field development. Insect feeding (thrips, scale insects) on young fruit. Physical contact with leaves, twigs or other fruit during growth. Chemical spray residue or fertiliser contact.',
                    shipmentImpact: 'Purely cosmetic — no effect on eating quality or safety. Can significantly reduce marketability for fresh export markets with strict cosmetic standards. Retail rejection rates can be high for premium markets.',
                    temperatureEffects: 'No significant temperature effect on pre-existing blemishes during transport.',
                    acceptReject: 'Blemishes covering less than 5% of surface: Accept for most markets. 5–15%: Standard retail downgrade. Over 15% or affecting highly visible areas: Reject for premium fresh markets, redirect to processing.',
                    prevention: 'Preharvest pest and disease management programme. Bagging of fruit during development protects from insects and contact damage. Careful harvesting and packing to avoid creating new marks.',
                },
                nl: {
                    name: 'Huidvlekken & Schurft',
                    shortDesc: 'Kurkerige, ruwe vlekken of stippen op de schil',
                    whatIsIt: 'Huidvlekken bij mango omvatten een reeks cosmetische gebreken: schurft (veroorzaakt door de schimmel Elsinoe mangiferae), lenticelstippen en diverse oppervlakkige merken van insectenvraat of fysiek contact. Dit zijn voornamelijk cosmetische problemen maar kunnen de verkoopbaarheid significant beïnvloeden in verse exportmarkten.',
                    howToIdentify: 'Ruwe, kurkerige, licht verheven vlekken op de schil — doorgaans lichtbruin tot grijs. Lenticelstippen verschijnen als donkere stippen rond de natuurlijke poriën van de schil. Schurftletsels hebben een kenmerkende ruwe, wrattige textuur. Deze gebreken dringen niet door in het vruchtvlees.',
                    causes: 'Schurftschimmelinfectie (Elsinoe mangiferae) tijdens veldontwikkeling. Insectenvraat (trips, schildluizen) op jong fruit. Fysiek contact met bladeren, twijgen of ander fruit tijdens groei. Chemisch spuitresidu of meststofcontact.',
                    shipmentImpact: 'Puur cosmetisch — geen effect op eetkwaliteit of veiligheid. Kan verkoopbaarheid significant verminderen voor verse exportmarkten met strenge cosmetische normen.',
                    temperatureEffects: 'Geen significante temperatuureffect op reeds bestaande vlekken tijdens transport.',
                    acceptReject: 'Vlekken die minder dan 5% van het oppervlak bedekken: Accepteren voor de meeste markten. 5–15%: Standaard detailhandel afwaardering. Over 15% of zeer zichtbare gebieden aantastend: Afkeuren voor premium verse markten, doorsturen naar verwerking.',
                    prevention: 'Pre-oogst plaag- en ziektebeheer programma. Inzakken van fruit tijdens ontwikkeling beschermt tegen insecten en contactschade. Zorgvuldige oogst en verpakking om nieuwe merken te vermijden.',
                }
            },
        ],
        internal: [
            {
                id: 'm-spongy-tissue',
                severity: 'major',
                emoji: '🧽',
                images: [
                    'images/defects/mango-spongy-1.jpg',
                    'images/defects/mango-spongy-2.jpg',
                ],
                en: {
                    name: 'Spongy Tissue',
                    shortDesc: 'Hard, dry, cream-coloured areas in the flesh',
                    whatIsIt: 'Spongy tissue (also called "soft nose" or "jelly seed" depending on the location) is a physiological disorder where areas of the mango flesh develop an abnormal texture — hard, dry, cream-coloured and sponge-like. The affected tissue has a bland, unpleasant flavour. It is one of the most serious internal quality problems in mango export.',
                    howToIdentify: 'Only visible when the fruit is cut open. Cream-coloured to yellowish, hard or sponge-like areas in the flesh, often near the seed or at the distal end (nose) of the fruit. The affected area contrasts clearly with the normal orange-yellow flesh. Texture is drier and fibrous compared to normal flesh.',
                    causes: 'Nutritional imbalance — particularly calcium deficiency and high nitrogen levels during fruit development. Water stress or irregular irrigation during fruit fill. High temperatures during the final weeks of fruit development on the tree. Certain varieties are more susceptible.',
                    shipmentImpact: 'Cannot be detected without cutting the fruit. Discovered only at retail or consumer level. Major cause of consumer complaints. Can affect large proportions of a consignment from susceptible growing areas or seasons.',
                    temperatureEffects: 'Spongy tissue is a preharvest disorder and is not significantly affected by postharvest temperature management. However proper cold chain management prevents secondary decay of affected areas.',
                    acceptReject: 'Cut sampling required to detect. Spongy tissue in less than 5% of sampled fruit: Accept with notification to supplier. More than 5–10%: Reject consignment and investigate origin. Widespread occurrence: Full consignment rejection.',
                    prevention: 'Proper nutrition management especially calcium during fruit development. Consistent irrigation avoiding water stress. Harvest at correct maturity. Source from reputable farms with documented nutrition management programmes.',
                },
                nl: {
                    name: 'Sponsachtig Weefsel',
                    shortDesc: 'Hard, droog, crèmekleurig weefsel in het vruchtvlees',
                    whatIsIt: 'Sponsachtig weefsel (ook wel "zachte neus" of "geleipit" afhankelijk van de locatie) is een fysiologische aandoening waarbij gebieden van het mangovruchtvlees een abnormale textuur ontwikkelen — hard, droog, crèmekleurig en sponsachtig. Het aangetaste weefsel heeft een flaue, onaangename smaak. Het is een van de ernstigste interne kwaliteitsproblemen bij mango-export.',
                    howToIdentify: 'Alleen zichtbaar wanneer het fruit wordt opengesneden. Crèmekleurig tot geelachtig, hard of sponsachtig weefsel in het vruchtvlees, vaak nabij de pit of aan het distale uiteinde (neus) van het fruit. Het aangetaste gebied contrasteert duidelijk met het normale oranje-gele vruchtvlees.',
                    causes: 'Voedingsgebrek — met name calciumgebrek en hoge stikstofniveaus tijdens vruchtontwikkeling. Waterstress of onregelmatige irrigatie tijdens vruchtvulling. Hoge temperaturen tijdens de laatste weken van vruchtontwikkeling aan de boom. Bepaalde variëteiten zijn vatbaarder.',
                    shipmentImpact: 'Kan niet worden gedetecteerd zonder het fruit te snijden. Ontdekt alleen op retail- of consumentenniveau. Grote oorzaak van consumentenklachten. Kan grote proportions van een zending aantasten uit vatbare groeigebieden.',
                    temperatureEffects: 'Sponsachtig weefsel is een pre-oogst aandoening en wordt niet significant beïnvloed door post-oogst temperatuurbeheer. Correct koelketen beheer voorkomt echter secundair verval van aangetaste gebieden.',
                    acceptReject: 'Snijbemonstering vereist om te detecteren. Sponsachtig weefsel in minder dan 5% van bemonsterd fruit: Accepteren met kennisgeving aan leverancier. Meer dan 5–10%: Zending afkeuren en herkomst onderzoeken. Wijdverspreid voorkomen: Volledige zendingsafkeuring.',
                    prevention: 'Correct voedingsbeheer met name calcium tijdens vruchtontwikkeling. Consistente irrigatie die waterstress vermijdt. Oogsten op correct rijpingstadium. Betrekken van gerenommeerde boerderijen met gedocumenteerde voedingsbeheer programma\'s.',
                }
            },
            {
                id: 'm-internal-breakdown',
                severity: 'major',
                emoji: '🔴',
                images: [
                    'images/defects/mango-breakdown-1.jpg',
                ],
                en: {
                    name: 'Internal Breakdown',
                    shortDesc: 'Soft, watery, discoloured flesh with no external sign',
                    whatIsIt: 'Internal breakdown is a physiological disorder characterised by softening, browning and water-soaking of mango flesh without visible external symptoms. It is often caused by chilling injury (temperatures below 10°C) or overripeness. The affected flesh has an off-flavour and unpleasant texture.',
                    howToIdentify: 'Visible only on cutting. Soft, watery, brown or grey discolouration of the flesh. The texture is mushy and the fruit may have a fermented or alcoholic odour. External skin colour and firmness may appear completely normal.',
                    causes: 'Chilling injury from storage below 10°C. Extended overripe storage. Rapid temperature fluctuations during storage. Ethylene overexposure during ripening. Certain varieties are inherently more susceptible.',
                    shipmentImpact: 'Invisible during external inspection. Major cause of consumer complaints. Can affect large portions of a consignment particularly from consignments stored at incorrect temperatures.',
                    temperatureEffects: 'Mango should never be stored below 10°C to avoid chilling injury. Optimal storage 10–13°C. Once chilling injury has occurred it cannot be reversed.',
                    acceptReject: 'Cut sampling required. Internal breakdown in more than 3% of sampled fruit: Reject. Isolated breakdown near seed only: Downgrade. Any fermented odour detected: Reject entire lot.',
                    prevention: 'Never store below 10°C. Monitor cold chain temperatures rigorously. Dispatch promptly after ripening. Source from farms with proven cold chain management. Use temperature loggers in all shipments.',
                },
                nl: {
                    name: 'Interne Afbraak',
                    shortDesc: 'Zacht, waterig, verkleurd vruchtvlees zonder extern teken',
                    whatIsIt: 'Interne afbraak is een fysiologische aandoening gekenmerkt door verzachting, bruinkleuring en doorweking van mangovjruchtvlees zonder zichtbare externe symptomen. Het wordt vaak veroorzaakt door kouschade (temperaturen onder 10°C) of overrijpheid. Het aangetaste vruchtvlees heeft een afwijkende smaak en onaangename textuur.',
                    howToIdentify: 'Alleen zichtbaar bij snijden. Zacht, waterig, bruin of grijs verkleurd vruchtvlees. De textuur is moes-achtig en het fruit kan een gefermenteerde of alcoholische geur hebben. Externe schilkleur en stevigheid kunnen volledig normaal lijken.',
                    causes: 'Kouschade door opslag onder 10°C. Verlengde overrijpe opslag. Snelle temperatuurschommelingen tijdens opslag. Ethyleenoverblootstelling tijdens rijping. Bepaalde variëteiten zijn inherent vatbaarder.',
                    shipmentImpact: 'Onzichtbaar tijdens externe inspectie. Grote oorzaak van consumentenklachten. Kan grote delen van een zending aantasten met name van zendingen opgeslagen bij onjuiste temperaturen.',
                    temperatureEffects: 'Mango mag nooit worden opgeslagen onder 10°C om kouschade te vermijden. Optimale opslag 10–13°C. Zodra kouschade is opgetreden kan het niet worden omgekeerd.',
                    acceptReject: 'Snijbemonstering vereist. Interne afbraak in meer dan 3% van bemonsterd fruit: Afkeuren. Geïsoleerde afbraak alleen nabij pit: Afwaarderen. Gefermenteerde geur gedetecteerd: Volledige partij afkeuren.',
                    prevention: 'Nooit bewaren onder 10°C. Bewaak koelketen temperaturen rigoureus. Snel verzenden na rijping. Betrekken van boerderijen met bewezen koelketen beheer. Gebruik temperatuurloggers in alle zendingen.',
                }
            },
        ]
    },

    // ═══════════════════════════════════════════════════════════
    // AVOCADO
    // ═══════════════════════════════════════════════════════════
    avocado: {
        external: [
            {
                id: 'a-anthracnose',
                severity: 'critical',
                emoji: '⚫',
                images: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Avocado_with_anthracnose.jpg/640px-Avocado_with_anthracnose.jpg',
                    'images/defects/avocado-anthracnose-1.jpg',
                    'images/defects/avocado-anthracnose-2.jpg',
                ],
                en: {
                    name: 'Anthracnose (Body Rot)',
                    shortDesc: 'Sunken black lesions spreading across the skin',
                    whatIsIt: 'Anthracnose — also called body rot in avocado — is caused primarily by Colletotrichum gloeosporioides. It is one of the two most economically important postharvest diseases of avocado globally. Like in mango and banana, the infection is latent: it is established in the field during fruit development but activates only during ripening. Body rots account for approximately 20% of all quality defects found on retail avocados.',
                    howToIdentify: 'Sunken, dark brown to black lesions that typically start at a point of mechanical damage or skin lenticel and expand rapidly across the skin. The lesions are circular initially, becoming irregular as they coalesce. When cut open, the affected flesh shows brown discolouration extending beneath the lesion. In wet conditions, salmon-pink spore masses (acervuli) may be visible in the lesion centre.',
                    causes: 'Latent infection established in the field before harvest. Mechanical damage during harvest and packing creates infection entry points. High humidity during field development. Wounds from handling activate latent infections. Post-harvest temperature above 20°C accelerates disease development.',
                    shipmentImpact: 'Major cause of rejection at European import points. Incidence rates surpass 30% in some producing regions. Can spread from fruit to fruit in warm, humid conditions within a box. Colombian packinghouses have reported rejection rates up to 52.5% for anthracnose.',
                    temperatureEffects: 'Cold storage at 5–7°C (Hass) effectively slows disease development. Disease activates rapidly when fruit is warmed for ripening. Heat treatment (hot water at 40–45°C for 30 minutes) before storage reduces latent infection levels.',
                    acceptReject: 'Any visible anthracnose lesion: Reject for premium fresh markets. Small lesion less than 5mm with no spread: Downgrade only. Multiple lesions or lesion over 1cm: Reject. Evidence of internal discolouration beneath lesion: Reject.',
                    prevention: 'Minimise mechanical damage at all stages. Post-harvest fungicide treatment (Prochloraz). Hot water treatment before cold storage. Rapid cooling after harvest. Careful packing to prevent contact damage. Good preharvest plantation hygiene.',
                },
                nl: {
                    name: 'Antracnose (Lichaamsrot)',
                    shortDesc: 'Verzonken zwarte letsels die zich over de schil verspreiden',
                    whatIsIt: 'Antracnose — ook wel lichaamsrot bij avocado — wordt voornamelijk veroorzaakt door Colletotrichum gloeosporioides. Het is een van de twee meest economisch belangrijke post-oogst ziekten van avocado wereldwijd. Net als bij mango en banaan is de infectie latent: het wordt vastgesteld op het veld tijdens vruchtontwikkeling maar activeert alleen tijdens rijping. Lichaamsrot maakt ongeveer 20% uit van alle kwaliteitsgebreken op retail avocado\'s.',
                    howToIdentify: 'Verzonken, donkerbruin tot zwarte letsels die doorgaans beginnen op een punt van mechanische schade of huidlenticel en zich snel over de schil uitbreiden. De letsels zijn aanvankelijk cirkelvormig, worden onregelmatig naarmate ze samensmelten. Bij snijden toont het aangetaste vruchtvlees bruinkleuring die zich uitstrekt onder het letsel.',
                    causes: 'Latente infectie vastgesteld op het veld voor de oogst. Mechanische schade tijdens oogst en verpakking creëert infectie-ingangen. Hoge luchtvochtigheid tijdens veldontwikkeling. Wonden van behandeling activeren latente infecties.',
                    shipmentImpact: 'Grote oorzaak van afkeuring bij Europese invoerpunten. Incidentiepercentages overschrijden 30% in sommige productiegebieden. Kan van fruit op fruit verspreiden in warme, vochtige omstandigheden in een doos. Colombiaanse verpakkingsfabrieken hebben afkeurpercentages gemeld tot 52,5% voor antracnose.',
                    temperatureEffects: 'Koude opslag bij 5–7°C (Hass) vertraagt ziekteprogressie effectief. Ziekte activeert snel wanneer fruit wordt opgewarmd voor rijping. Warmtebehandeling (heet water bij 40–45°C gedurende 30 minuten) voor opslag vermindert latente infectieniveaus.',
                    acceptReject: 'Zichtbaar antracnose letsel: Afkeuren voor premium verse markten. Klein letsel minder dan 5mm zonder verspreiding: Alleen afwaarderen. Meerdere letsels of letsel over 1cm: Afkeuren. Bewijs van interne verkleuring onder letsel: Afkeuren.',
                    prevention: 'Minimaliseer mechanische schade in alle stadia. Post-oogst fungicidebehandeling (Prochloraz). Warmwaterbehandeling voor koude opslag. Snelle koeling na oogst. Zorgvuldige verpakking om contactschade te voorkomen. Goede pre-oogst plantage hygiëne.',
                }
            },
            {
                id: 'a-stem-end-rot',
                severity: 'critical',
                emoji: '🟫',
                images: [
                    'images/defects/avocado-stem-end-rot-1.jpg',
                    'images/defects/avocado-stem-end-rot-2.jpg',
                ],
                en: {
                    name: 'Stem End Rot',
                    shortDesc: 'Dark rot spreading from the stem end',
                    whatIsIt: 'Stem end rot in avocado is caused by Botryosphaeriaceae fungi — primarily Neofusicoccum species, Lasiodiplodia theobromae, and Botryosphaeria species. These fungi colonise the stem tissue before harvest as latent endophytes and activate during ripening. It is considered the most economically significant postharvest disease of avocado in many producing countries. Rejection rates up to 70.1% have been recorded in some Colombian packinghouses.',
                    howToIdentify: 'Dark brown to black discolouration beginning at the stem end of the fruit and progressively spreading toward the base. The skin develops a dark, sunken appearance at the stem end. Internal examination shows brown to black discolouration of the vascular tissue and flesh starting from the stem. In advanced stages the entire fruit softens and decays.',
                    causes: 'Fungal endophytes colonise the stem before harvest. Removing the stem completely during harvest dramatically increases risk. Wounds and damage near the stem end. Delays between harvest and fungicide treatment. Warm conditions post-harvest accelerating fungal growth.',
                    shipmentImpact: 'One of the primary causes of consignment rejection globally. Disease is invisible at harvest and only appears during ripening at destination. Can render entire pallets worthless within days of arrival at destination. Particularly severe when fruit is harvested without retaining any stem.',
                    temperatureEffects: 'Cold storage at 5–7°C significantly slows disease progression. Rapid cooling after harvest is essential. Above 20°C the disease progresses rapidly. Maintaining the cold chain throughout transport is critical.',
                    acceptReject: 'Any visible stem end discolouration: Reject. Stem end with no visible symptoms but cut sample showing internal browning: Reject. Fruit harvested without stem attached: Higher risk — increase sampling rate.',
                    prevention: 'Always retain a short stub of stem at harvest. Rapid cooling after harvest. Fungicide dip (Prochloraz) within 4 hours of harvest. Avoid any damage to the stem end area. Maintain unbroken cold chain during transport.',
                },
                nl: {
                    name: 'Stengeluiteinde Rot',
                    shortDesc: 'Donker rot dat zich verspreidt vanuit het stengeluiteinde',
                    whatIsIt: 'Stengeluiteinde rot bij avocado wordt veroorzaakt door Botryosphaeriaceae schimmels — voornamelijk Neofusicoccum soorten, Lasiodiplodia theobromae en Botryosphaeria soorten. Deze schimmels koloniseren het stengelweefsel voor de oogst als latente endofyten en activeren tijdens rijping. Het wordt beschouwd als de meest economisch significante post-oogst ziekte van avocado in veel producerende landen. Afkeurpercentages tot 70,1% zijn geregistreerd in sommige Colombiaanse verpakkingsfabrieken.',
                    howToIdentify: 'Donkerbruin tot zwarte verkleuring beginnend bij het stengeluiteinde van het fruit en progressief verspreidend richting de basis. De schil ontwikkelt een donker, verzonken uiterlijk bij het stengeluiteinde. Intern onderzoek toont bruin tot zwarte verkleuring van het vasculaire weefsel en vruchtvlees vanuit de steel.',
                    causes: 'Schimmelendofyten koloniseren de steel voor de oogst. Het volledig verwijderen van de steel tijdens de oogst verhoogt het risico dramatisch. Wonden en schade nabij het stengeluiteinde. Vertragingen tussen oogst en fungicidebehandeling.',
                    shipmentImpact: 'Een van de primaire oorzaken van zendingsafkeuring wereldwijd. Ziekte is onzichtbaar bij de oogst en verschijnt pas tijdens rijping op bestemming. Kan volledige pallets waardeloos maken binnen dagen na aankomst. Bijzonder ernstig wanneer fruit wordt geoogst zonder steel te bewaren.',
                    temperatureEffects: 'Koude opslag bij 5–7°C vertraagt ziekteprogressie significant. Snelle koeling na oogst is essentieel. Boven 20°C vordert de ziekte snel. Het handhaven van de koelketen tijdens transport is essentieel.',
                    acceptReject: 'Zichtbare stengeluiteinde verkleuring: Afkeuren. Stengeluiteinde zonder zichtbare symptomen maar snijmonster met interne bruinkleuring: Afkeuren. Fruit geoogst zonder steel bevestigd: Hoger risico — bemonsteringsfrequentie verhogen.',
                    prevention: 'Bewaar altijd een korte steel bij oogst. Snelle koeling na oogst. Fungicide dip (Prochloraz) binnen 4 uur na oogst. Vermijd schade aan het stengeluiteinde gebied. Handhaaf ononderbroken koelketen tijdens transport.',
                }
            },
            {
                id: 'a-bruising',
                severity: 'major',
                emoji: '🟤',
                images: [
                    'images/defects/avocado-bruising-1.jpg',
                    'images/defects/avocado-bruising-2.jpg',
                ],
                en: {
                    name: 'Bruising',
                    shortDesc: 'Brown soft areas from mechanical impact',
                    whatIsIt: 'Bruising in avocado is one of the most significant postharvest quality problems. The fruit flesh is highly susceptible to impact damage, particularly as it softens during ripening. Bruised areas turn brown due to enzymatic oxidation and create ideal conditions for fungal infection especially anthracnose. Research has shown that body rots frequently develop at impact sites.',
                    howToIdentify: 'On hard green fruit bruising may not be visible externally. As the fruit softens, bruised areas appear darker on the skin and soft to the touch. Cutting reveals brown, discoloured and often water-soaked areas in the flesh. Bruising frequently occurs in a pattern matching the packing tray or contact surface.',
                    causes: 'Impact during harvesting (pole picking, dropping). Rough handling during packing and palletising. Vibration damage during road or sea transport. Overfilling of boxes. Contact with hard surfaces of packing trays. Cold storage below 5°C makes flesh more brittle.',
                    shipmentImpact: 'Bruising and the secondary fungal infections it causes are major drivers of avocado postharvest losses globally. Bruised fruit has reduced shelf life and significantly reduced eating quality. Creates ideal entry points for anthracnose and other decay organisms.',
                    temperatureEffects: 'Cold storage below 5°C (Hass) makes the flesh more brittle and susceptible to bruising. Fruit should not be handled roughly when cold. Bruise susceptibility increases significantly during ripening as the flesh softens.',
                    acceptReject: 'Bruised area less than 3% of fruit surface: Accept. Bruised area 3–10%: Downgrade. Over 10% or multiple impact sites: Reject. Any evidence of fungal decay at bruise site: Reject immediately.',
                    prevention: 'Use padded harvesting poles and containers. Minimise drop height during harvest. Handle cold fruit gently. Use appropriate packing trays and box inserts. Avoid overfilling. Ensure smooth transport conditions.',
                },
                nl: {
                    name: 'Kneuzing',
                    shortDesc: 'Bruine zachte gebieden van mechanische stoot',
                    whatIsIt: 'Kneuzing bij avocado is een van de meest significante post-oogst kwaliteitsproblemen. Het vruchtvlees is zeer vatbaar voor stootschade, met name naarmate het verzacht tijdens rijping. Gekneusd vruchtvlees wordt bruin door enzymatische oxidatie en creëert ideale omstandigheden voor schimmelinfectie met name antracnose.',
                    howToIdentify: 'Bij hard groen fruit is kneuzing mogelijk niet extern zichtbaar. Naarmate het fruit verzacht, verschijnen gekneusd gebieden donkerder op de schil en zacht bij aanraking. Snijden onthult bruine, verkleurde en vaak doorweekte gebieden in het vruchtvlees.',
                    causes: 'Stoot tijdens oogst (palen plukken, vallen). Ruw behandelen tijdens verpakking en palletisering. Trilschade tijdens weg- of zeetransport. Overvulling van dozen. Contact met harde oppervlakken van verpakkingsschalen. Koude opslag onder 5°C maakt vruchtvlees brozer.',
                    shipmentImpact: 'Kneuzing en de secundaire schimmelinfecties die het veroorzaakt zijn grote aanjagers van avocado post-oogst verliezen wereldwijd. Gekneusd fruit heeft verminderde houdbaarheid en significant verminderde eetkwaliteit.',
                    temperatureEffects: 'Koude opslag onder 5°C (Hass) maakt het vruchtvlees brozer en vatbaarder voor kneuzing. Fruit moet niet ruw worden behandeld wanneer koud. Kneusvatbaarheid neemt significant toe tijdens rijping naarmate het vruchtvlees verzacht.',
                    acceptReject: 'Gekneusd gebied minder dan 3% van het vruchtoppervlak: Accepteren. Gekneusd gebied 3–10%: Afwaarderen. Over 10% of meerdere impactpunten: Afkeuren. Bewijs van schimmelrot op kneusingsplek: Onmiddellijk afkeuren.',
                    prevention: 'Gebruik gevoerde oogstpalen en containers. Minimaliseer valhoogte tijdens oogst. Behandel koud fruit voorzichtig. Gebruik geschikte verpakkingsschalen en doosinzetstukken. Vermijd overvulling. Zorg voor soepele transportomstandigheden.',
                }
            },
            {
                id: 'a-skin-cracking',
                severity: 'minor',
                emoji: '🟢',
                images: [
                    'images/defects/avocado-cracking-1.jpg',
                ],
                en: {
                    name: 'Skin Cracking & Scab',
                    shortDesc: 'Surface cracks or rough scabby patches on skin',
                    whatIsIt: 'Skin cracking and scab on avocado are cosmetic defects that can result from various causes including growth cracking (rapid size increase), insect feeding, or fungal scab diseases. While they do not usually affect eating quality, they can significantly reduce marketability particularly in premium export markets.',
                    howToIdentify: 'Irregular cracks or fissures on the skin surface. Scab appears as rough, corky, brownish patches. Growth cracks typically run lengthwise on the fruit. Insect damage creates small round pits or corky spots. These defects are purely on the skin and do not penetrate the flesh.',
                    causes: 'Rapid fruit growth following rainfall after a dry period causing the skin to crack. Insect feeding (avocado thrips, spider mites) on young fruit. Fungal scab diseases in the field. Wind scarring in exposed plantations.',
                    shipmentImpact: 'Purely cosmetic — no effect on eating quality or safety. Can lead to rejection by premium retailers with strict cosmetic grading standards.',
                    temperatureEffects: 'No significant temperature effect on pre-existing skin defects during transport.',
                    acceptReject: 'Cracks or scab covering less than 5% of surface: Accept for most markets. 5–15%: Standard retail, downgrade for premium. Over 15%: Redirect to processing or secondary markets.',
                    prevention: 'Consistent irrigation management to avoid sudden growth surges. Preharvest pest management for thrips and mites. Protective netting in exposed plantations.',
                },
                nl: {
                    name: 'Huidscheuren & Schurft',
                    shortDesc: 'Oppervlaktescheuren of ruwe schurftvlekken op schil',
                    whatIsIt: 'Huidscheuren en schurft bij avocado zijn cosmetische gebreken die kunnen voortkomen uit diverse oorzaken waaronder groeischeuren (snelle omvangtoename), insectenvraat of schimmelschurftse ziekten. Hoewel ze de eetkwaliteit normaal niet beïnvloeden, kunnen ze de verkoopbaarheid significant verminderen met name in premium exportmarkten.',
                    howToIdentify: 'Onregelmatige scheuren of spleten op het huidoppervlak. Schurft verschijnt als ruwe, kurkerige, bruinachtige vlekken. Groeischeuren lopen doorgaans lengterichting op het fruit. Insectenschade creëert kleine ronde putjes of kurkerige stippen.',
                    causes: 'Snelle vruchtsgroei na neerslag na een droge periode waardoor de schil scheurt. Insectenvraat (avocadotrips, spintmijten) op jong fruit. Schimmelschurftse ziekten op het veld. Windschade in blootgestelde plantages.',
                    shipmentImpact: 'Puur cosmetisch — geen effect op eetkwaliteit of veiligheid. Kan leiden tot afkeuring door premium retailers met strenge cosmetische graderingsnormen.',
                    temperatureEffects: 'Geen significante temperatuureffect op reeds bestaande huidgebreken tijdens transport.',
                    acceptReject: 'Scheuren of schurft minder dan 5% van het oppervlak: Accepteren voor de meeste markten. 5–15%: Standaard detailhandel, afwaarderen voor premium. Over 15%: Doorsturen naar verwerking of secundaire markten.',
                    prevention: 'Consistent irrigatiebeheer om plotselinge groeistoten te vermijden. Pre-oogst plaagbeheer voor trips en spintmijten. Beschermende netten in blootgestelde plantages.',
                }
            },
        ],
        internal: [
            {
                id: 'a-flesh-browning',
                severity: 'major',
                emoji: '🟫',
                images: [
                    'images/defects/avocado-flesh-browning-1.jpg',
                    'images/defects/avocado-flesh-browning-2.jpg',
                ],
                en: {
                    name: 'Internal Flesh Browning',
                    shortDesc: 'Brown or grey discolouration of flesh',
                    whatIsIt: 'Internal flesh browning in avocado can result from several causes: chilling injury (the most common), overripeness, or enzymatic oxidation triggered by physical damage. The flesh develops brown or grey-brown discolouration that is invisible externally. Affected flesh has reduced eating quality with off-flavours and unpleasant texture.',
                    howToIdentify: 'Only visible when the fruit is cut open. Brown or grey-brown discolouration of the flesh, often starting near the seed cavity or just under the skin. In chilling injury cases the discolouration follows the vascular bundles. The affected areas have a dry or mealy texture. External skin colour and firmness may appear completely normal.',
                    causes: 'Chilling injury from storage below 5°C (Hass variety) causes the most common form. Enzymatic browning from physical damage to the flesh. Overripeness. CO2 injury from improper controlled atmosphere conditions.',
                    shipmentImpact: 'Invisible during external inspection. Major cause of consumer complaints and product returns. Can affect large proportions of a consignment from poorly managed cold chains. Particularly problematic as it cannot be detected without destructive sampling.',
                    temperatureEffects: 'Hass avocados must never be stored below 5°C to avoid chilling injury. Optimal storage temperature is 5–7°C. At temperatures of 2–5°C, chilling injury and internal browning develop within 1–2 weeks. Graza or Fuerte varieties may be even more sensitive.',
                    acceptReject: 'Random destructive sampling required. Browning in less than 5% of sampled fruit: Accept with supplier notification. 5–10%: Investigate cold chain, consider rejection. Over 10%: Reject consignment.',
                    prevention: 'Strict cold chain management at 5–7°C for Hass. Never expose to temperatures below 5°C. Monitor cold chain continuously from harvest to retail. Use temperature loggers in all shipments. Handle gently to minimise tissue damage.',
                },
                nl: {
                    name: 'Interne Vruchtvlees Bruinkleuring',
                    shortDesc: 'Bruine of grijze verkleuring van het vruchtvlees',
                    whatIsIt: 'Interne vruchtvlees bruinkleuring bij avocado kan het gevolg zijn van verschillende oorzaken: kouschade (de meest voorkomende), overrijpheid of enzymatische oxidatie getriggerd door fysieke schade. Het vruchtvlees ontwikkelt bruine of grijs-bruine verkleuring die extern onzichtbaar is. Aangetast vruchtvlees heeft verminderde eetkwaliteit met afwijkende smaken en onaangename textuur.',
                    howToIdentify: 'Alleen zichtbaar wanneer het fruit wordt opengesneden. Bruine of grijs-bruine verkleuring van het vruchtvlees, vaak beginnend nabij de pitholte of net onder de schil. Bij kouschadegevallen volgt de verkleuring de vaatbundels. De aangetaste gebieden hebben een droge of melige textuur.',
                    causes: 'Kouschade door opslag onder 5°C (Hass variëteit) veroorzaakt de meest voorkomende vorm. Enzymatische bruinkleuring van fysieke schade aan het vruchtvlees. Overrijpheid. CO2-schade door onjuiste gecontroleerde atmosferische omstandigheden.',
                    shipmentImpact: 'Onzichtbaar tijdens externe inspectie. Grote oorzaak van consumentenklachten en productretouren. Kan grote proportions van een zending aantasten van slecht beheerde koelketens.',
                    temperatureEffects: 'Hass avocado\'s mogen nooit worden opgeslagen onder 5°C om kouschade te vermijden. Optimale opslagtemperatuur is 5–7°C. Bij temperaturen van 2–5°C ontwikkelen kouschade en interne bruinkleuring zich binnen 1–2 weken.',
                    acceptReject: 'Willekeurige destructieve bemonstering vereist. Bruinkleuring in minder dan 5% van bemonsterd fruit: Accepteren met leveranciersmededeling. 5–10%: Onderzoek koelketen, overweeg afkeuring. Over 10%: Zending afkeuren.',
                    prevention: 'Strikt koelketen beheer bij 5–7°C voor Hass. Nooit blootstellen aan temperaturen onder 5°C. Bewaak koelketen continu van oogst tot retail. Gebruik temperatuurloggers in alle zendingen. Behandel voorzichtig om weefselschade te minimaliseren.',
                }
            },
            {
                id: 'a-vascular-browning',
                severity: 'major',
                emoji: '🩸',
                images: [
                    'images/defects/avocado-vascular-1.jpg',
                ],
                en: {
                    name: 'Vascular Browning',
                    shortDesc: 'Brown streaks along the vascular bundles in flesh',
                    whatIsIt: 'Vascular browning in avocado appears as brown to black discolouration along the vascular bundle network that runs throughout the flesh. It is most commonly associated with stem end rot disease (fungal invasion progressing into the vascular system) or chilling injury. The vascular bundles serve as the pathway for fungi invading from the stem.',
                    howToIdentify: 'Visible when the avocado is cut open. Brown to dark brown discolouration following the pattern of the vascular bundles from the stem area toward the seed and flesh. In early stages only a few bundles are affected. In advanced cases most of the flesh shows browning along the vascular network. Associated with off-flavours and reduced quality.',
                    causes: 'Stem end rot fungi (Neofusicoccum, Lasiodiplodia) invading via the stem vascular system. Chilling injury affecting vascular tissue particularly at below 5°C. Physical damage to the stem area during harvest. Infection entering through the stem wound at harvest.',
                    shipmentImpact: 'Signals advanced stem end rot or severe cold chain failure. Fruit with significant vascular browning has severely reduced eating quality and shelf life. Major cause of consumer complaints when discovered at home.',
                    temperatureEffects: 'Directly associated with both chilling injury (below 5°C) and the temperature-dependent progression of stem end rot. Maintaining 5–7°C during the entire cold chain is critical to minimise risk.',
                    acceptReject: 'Vascular browning visible at cut: Reject. Any browning near the stem end of cut surface: Investigate entire lot. Browning confined to a single minor bundle: Borderline — consider downgrading.',
                    prevention: 'Retain stem at harvest. Rapid cooling after harvest. Strict cold chain management at 5–7°C. Fungicide treatment to prevent SER. Avoid all damage to the stem end area.',
                },
                nl: {
                    name: 'Vasculaire Bruinkleuring',
                    shortDesc: 'Bruine strepen langs de vaatbundels in het vruchtvlees',
                    whatIsIt: 'Vasculaire bruinkleuring bij avocado verschijnt als bruine tot zwarte verkleuring langs het vaatbundelnetwerk dat door het vruchtvlees loopt. Het is het meest geassocieerd met stengeluiteinde rot ziekte (schimmelinvasie die in het vasculaire systeem vordert) of kouschade. De vaatbundels dienen als pad voor schimmels die via de steel binnendringen.',
                    howToIdentify: 'Zichtbaar wanneer de avocado wordt opengesneden. Bruine tot donkerbruine verkleuring die het patroon van de vaatbundels volgt vanuit het stengelgebied richting de pit en het vruchtvlees. In vroege stadia worden slechts enkele bundels aangetast. In gevorderde gevallen toont het grootste deel van het vruchtvlees bruinkleuring langs het vasculaire netwerk.',
                    causes: 'Stengeluiteinde rot schimmels (Neofusicoccum, Lasiodiplodia) die via het vasculaire systeem van de steel binnendringen. Kouschade die vasculair weefsel aantast met name onder 5°C. Fysieke schade aan het stengelgebied tijdens oogst.',
                    shipmentImpact: 'Signaleert gevorderd stengeluiteinde rot of ernstig koelketen falen. Fruit met significante vasculaire bruinkleuring heeft ernstig verminderde eetkwaliteit en houdbaarheid.',
                    temperatureEffects: 'Direct geassocieerd met zowel kouschade (onder 5°C) als de temperatuurafhankelijke progressie van stengeluiteinde rot. Handhaven van 5–7°C tijdens de gehele koelketen is essentieel om risico te minimaliseren.',
                    acceptReject: 'Vasculaire bruinkleuring zichtbaar bij snijden: Afkeuren. Bruinkleuring nabij het stengeluiteinde van het snijoppervlak: Onderzoek volledige partij. Bruinkleuring beperkt tot één kleine bundel: Grensgevalle — overweeg afwaardering.',
                    prevention: 'Bewaar steel bij oogst. Snelle koeling na oogst. Strikt koelketen beheer bij 5–7°C. Fungicidebehandeling om SER te voorkomen. Vermijd alle schade aan het stengeluiteinde gebied.',
                }
            },
            {
                id: 'a-seed-cavity-mould',
                severity: 'major',
                emoji: '🔵',
                images: [
                    'images/defects/avocado-seed-mould-1.jpg',
                ],
                en: {
                    name: 'Seed Cavity Mould',
                    shortDesc: 'Fungal growth in the seed cavity',
                    whatIsIt: 'Seed cavity mould refers to fungal growth that develops in the space between the seed and the flesh of the avocado. Various fungi can colonise this area including Colletotrichum, Fusarium, Alternaria and other opportunistic species. This defect is invisible from the outside and is only discovered when the fruit is opened.',
                    howToIdentify: 'Visible only when the avocado is cut open and the seed removed. Grey, white, black or green fungal growth on the inner surface of the flesh or on the seed surface. The surrounding flesh may show discolouration or water-soaking. May be accompanied by off-odours.',
                    causes: 'Fungal infection entering through the stem end and migrating internally. Infection through lenticels or microcracks in the skin. Secondary infection following physical damage. Prolonged storage allowing slow-growing fungi to establish in the seed cavity.',
                    shipmentImpact: 'Cannot be detected externally. Major cause of consumer complaints and returns. Affects eating safety as well as quality. Can signal broader postharvest management problems in the supply chain.',
                    temperatureEffects: 'Cold storage at 5–7°C limits fungal growth but cannot eliminate established infections. Prolonged cold storage beyond optimal limits can allow slow-growing psychrotrophic fungi to develop.',
                    acceptReject: 'Any fungal growth in seed cavity: Reject for food safety reasons. Discolouration of seed cavity flesh without active mould: Downgrade and investigate. Check multiple fruit from the same box if mould found.',
                    prevention: 'Proper fungicide treatment post-harvest. Maintain cold chain. Avoid prolonged storage beyond optimal. Do not harvest overripe fruit. Handle gently to prevent skin microdamage.',
                },
                nl: {
                    name: 'Pitholte Schimmel',
                    shortDesc: 'Schimmelgroei in de pitholte',
                    whatIsIt: 'Pitholte schimmel verwijst naar schimmelgroei die zich ontwikkelt in de ruimte tussen de pit en het vruchtvlees van de avocado. Verschillende schimmels kunnen dit gebied koloniseren waaronder Colletotrichum, Fusarium, Alternaria en andere opportunistische soorten. Dit gebrek is onzichtbaar van buitenaf en wordt alleen ontdekt wanneer het fruit wordt geopend.',
                    howToIdentify: 'Alleen zichtbaar wanneer de avocado wordt opengesneden en de pit verwijderd. Grijs, wit, zwart of groene schimmelgroei op het binnenoppervlak van het vruchtvlees of op het pitoppervlak. Het omliggende vruchtvlees kan verkleuring of doorweking tonen. Kan vergezeld gaan van afwijkende geuren.',
                    causes: 'Schimmelinfectie die via het stengeluiteinde binnendringt en intern migreert. Infectie via lenticellen of microscheuren in de schil. Secundaire infectie na fysieke schade. Verlengde opslag waardoor langzaam groeiende schimmels zich kunnen vestigen in de pitholte.',
                    shipmentImpact: 'Kan niet extern worden gedetecteerd. Grote oorzaak van consumentenklachten en retouren. Beïnvloedt voedselveiligheid evenals kwaliteit. Kan bredere post-oogst beheer problemen signaleren in de supply chain.',
                    temperatureEffects: 'Koude opslag bij 5–7°C beperkt schimmelgroei maar kan vastgestelde infecties niet elimineren. Verlengde koude opslag voorbij optimale grenzen kan langzaam groeiende psychrotrofe schimmels de kans geven zich te ontwikkelen.',
                    acceptReject: 'Schimmelgroei in pitholte: Afkeuren om voedseilveiligheidsredenen. Verkleuring van pitholte vruchtvlees zonder actieve schimmel: Afwaarderen en onderzoeken. Controleer meerdere vruchten uit dezelfde doos als schimmel wordt gevonden.',
                    prevention: 'Correcte fungicidebehandeling na oogst. Handhaaf koelketen. Vermijd verlengde opslag voorbij optimaal. Oogst geen overrijp fruit. Behandel voorzichtig om huid microschade te voorkomen.',
                }
            },
        ]
    }
};
