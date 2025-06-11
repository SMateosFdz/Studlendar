export function Calculate(blocks, hours, day){
    let flag = false;
    const ids = [];
    for(let i=25; i <= 209; i += 8){
        ids.push(i + day - 1);
    }

    const id = ids[hours];

    // eslint-disable-next-line array-callback-return
    blocks.map((block) => {
        if(block.blockId == id){
            flag = true;
        }
    })

    return flag;
}