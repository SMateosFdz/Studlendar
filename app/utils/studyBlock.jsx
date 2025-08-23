/**
 * Function to calculate if there is a block in a specific hour of a day
 * 
 * @param {List} blocks study blocks of the user
 * @param {int} hours current hour
 * @param {int} day current day 
 * 
 * @returns boolean flag and block name
 */
export function Calculate(blocks, hours, day){
    let flag = false;
    let blockName = "";
    const ids = [];
    for(let i=25; i <= 209; i += 8){
        ids.push(i + day - 1);
    }

    const id = ids[hours];

    // eslint-disable-next-line array-callback-return
    blocks.map((block) => {
        if(block.blockId == id){
            flag = true;
            blockName = block.name;
        }
    })

    return {flag, blockName}
}