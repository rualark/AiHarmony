$site_name$ can analyse your counterpoint excercises and find mistakes.

$site_name$ supports counterpoint excercises in the following counterpoint species in 1-9 voices:

![](docs/img/species.png)
 
\* This combination of species with time signature is supported, but is not recommended. Species 5 is supported only in time signatures 4/4 and 2/2.

Cantus firmus can be in any voice.

There should be only one exercise in one file, with each part on a separate stave like this:

![](docs/img/part_per_stave.png)

<b>Number of voices</b> supported: 1-9.<br>
<b>Counterpoint species</b> supported: 1, 2, 3, 4, 5 (for species 5 only time signature 4/4).<br>
<b>Time signatures</b> supported: 2/4, 3/4, 4/4, 2/2, 5/4 (species 1 and 3 only), 6/4, 3/2.<br>
<b>Modes</b> supported: major, melodic minor, ancient modes.<br>
<b>Chromatic alterations</b> supported: VI# and VII# in melodic minor only.<br>
<b>Chords</b> supported: triads, 7th chords (9th and other chords are not supported).<br>
<b>Tuplets and notes shorter than 1/8</b> are not supported.<br>
<b>Key signature</b> must be specified before exercise like this:

![](docs/img/key_signature.png)

## Parts

When uploading a counterpoint exercise, pay attention to separate parts in an exercise so that $site_name$ can differentiate between them.

The most simple and reliable way is to use a separate staff for each part:

![](docs/img/voices_staffs.png)

Another way is to use a separate "intra-staff voice" for each part. This variant can be difficult to read when there are many parts. Also, be careful with parts crossings:

![](docs/img/voices_voices.png)

You can combine two above methods to build separate staffs, each consisting of multiple "intra-staff voices". Pay attention not to move parts between staffs:

![](docs/img/voices_staffs_voices.png)

Chords (multiple notes with same stem) should be avoided, because they can lead to different issues when exporting from notation software. Also, parts crossings cannot be represented using chords. You can use chords or combine chords with multiple staffs or "intra-staff voices" at your own risk: it is not recommended.

## Vocal range detection

If you name part "Soprano", "Alto", "Tenor" or "Bass", $site_name$ will consider the part to be written in the specified vocal range.

If you use other names, $site_name$ will try to detect best possible vocal range for the part. 

## Advanced

Usually there is only one exercise in one MusicXML file, but if you need, you can put multiple exercises in a single MusicXML file. In this case please ensure that your exercises are separated either with an empty measure or with a double bar line.

If you put multiple exercises in a single MusicXML file, it is recommended that a single voice is written in the same species in all exercises. 

If voice is written in different species, you will have to specify species in your score instead of selecting it after uploading MusicXML. For this you can add lyrics or text to each exercise, for example "sp01" (for 2 voice counterpoint, having cantus firmus in the lowest voice and species 1 in the highest voice), "sp550" (for 3-voice counterpoint, having species 5 in the lowest and middle voice and cantus firmus in the highest voice). Each digit represents species for each voice, starting from the lowest voice. 0 means cantus firmus.

Pay attention, that if part does not have name "Soprano", "Alto, "Tenor" or "Bass", $site_name$ will try to automatically detect vocal range for this part in each exercise. Even if vocal range of a part is different in different exercises, playback of all exercises will be still fixed to first vocal range detected in this part.