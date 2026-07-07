import { getFeaturedExhibition } from './src/lib/exhibition-lifecycle';

async function main() {
  try {
    const ex = await getFeaturedExhibition();
    console.log("Success:", ex ? ex.id : "null");
  } catch (e) {
    console.error("Error thrown:", e);
  }
}
main();
