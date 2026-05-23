const fs = require('fs');
const path = require('path');

const musicDir = path.join(__dirname, 'music');
const outputFile = path.join(__dirname, 'music-metadata.json');

async function scanMusicDirectory() {
    console.log('Scanning music directory...');
    
    // Dynamic import of music-metadata
    const { parseFile } = await import('music-metadata');
    
    const files = fs.readdirSync(musicDir);
    const audioFiles = files.filter(file => file.endsWith('.mp3'));
    
    console.log(`Found ${audioFiles.length} audio files`);
    
    const playlist = [];
    
    for (const file of audioFiles) {
        const filePath = path.join(musicDir, file);
        
        try {
            const metadata = await parseFile(filePath);
            
            // Extract metadata with fallbacks
            const artist = metadata.common.artist || 'Unknown Artist';
            const title = metadata.common.title || file.replace('.mp3', '');
            const year = metadata.common.year ? ` - ${metadata.common.year}` : '';
            
            // Create display name
            const display = `${artist} - ${title}${year}`;
            
            playlist.push({
                file: file,
                display: display
            });
            
            console.log(`Processed: ${display}`);
        } catch (error) {
            console.error(`Error reading metadata for ${file}:`, error.message);
            
            // Fallback to filename if metadata extraction fails
            const displayName = file.replace('.mp3', '').replace(/_/g, ' ');
            playlist.push({
                file: file,
                display: displayName
            });
        }
    }
    
    // Sort playlist by filename to maintain order
    playlist.sort((a, b) => a.file.localeCompare(b.file));
    
    // Write to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(playlist, null, 2));
    
    console.log(`\nGenerated music-metadata.json with ${playlist.length} tracks`);
    console.log('Done!');
}

scanMusicDirectory().catch(console.error);
