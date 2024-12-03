import { createWorker } from 'tesseract.js';
import Fuse from 'fuse.js'
import cards from './database.json'
import { cameraState } from '../lib/state.svelte';

// Create the Fuse index
const cardIndex = Fuse.createIndex([], cards)
const fuse = new Fuse(cards, {keys: [], includeScore:true}, cardIndex)

export async function recognize(dataURL: string) {
	const worker = await createWorker('eng');
	const ret = await worker.recognize(dataURL);
	worker.terminate();
	return ret.data.text;
	;
}

export function gibberish(title : string ) {
	const cleanedUp = title.replaceAll("\s", " ")
		 	.trim()
	const allSmall = cleanedUp.split(' ').every( s => s.length <= 2)
	if(allSmall)
		return null
	else 
		return cleanedUp
}


export async function getCards(title: string, filter: string) {

	const indexedItem = fuse.search(title)[0]
	if(!indexedItem)
		return []
	
	const indexedTitle = indexedItem.item
	cameraState.profiler.indexed_result.push(indexedTitle)
	return fetch(`https://admin.starwarsunlimited.com/api/card-list?locale=en&filters\[$and\]\[1\]\[$or\]\[0\]\[title\]\[$contains\]=${encodeURI(indexedTitle)}&pagination\[page\]=1&pagination\[pageSize\]=50`)
		.then(r => r.json())
		.then(r => r.data)
		.then(d => {
			if (d.length == 0)
				return []
			else //@ts-ignore
				return d.map(c => { console.log(c); return { 
					name: c.attributes.title, 
					card: c.attributes.artFront.data.attributes.formats.card.url,
					set : c.attributes.expansion.data.attributes.code,
					number : c.attributes.cardNumber,
					foil: c.attributes.hasFoil,
					hyperspace: c.attributes.hyperspace 
				}}).filter( c => filterCard(c, filter) )
		})

}

export function keepOnlyCapsAndNumbers(input: string): string {
	return input.replace(/[^A-Z0-9 ]/g, '');
}


function filterCard(card, filter) {
	switch(filter){
		case 'All' : return true 
		case 'Normal' : return !card.hyperspace && !card.foil 
		case 'Hyperspace' : return card.hyperspace
		case 'Foil' :  return card.foil 
		case 'HyperFoil' : return card.hyperspace && card.foil  
	}
}

export function downloadCSV(items) {

	const titleRow = "Set,CardNumber,Count,IsFoil"
	const rows = items.map( card => `${card.set},${card.number},${card.count},${card.foil ? "TRUE" : "FALSE"}`)
	const csvContent = titleRow + "\n" + rows.join("\n")
	
	// Create a Blob from the CSV content
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
	// Create a temporary anchor element
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'viper_droid_data.csv';
  
	// Trigger download
	link.click();
  
	// Clean up the URL object
	URL.revokeObjectURL(link.href);
  }
  