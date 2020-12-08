const TIMEOUT =  1000*20
const {promises} = require("fs")

const post = async ({client, photos, caption, fileName}) => {
    try {
        console.log("mulai upload foto...");
        await client.login()
        const res = await loopPost({client, photos, caption, fileName})
        return res
    } catch (error) {
        throw Error(error);
    }
}

const loopPost = ({client, photos, caption, fileName}) => {
    let i = 0
    const neko = setInterval(async() => {
        try {
            await client.uploadPhoto({ photo: photos[i], caption, post: 'feed' })
            console.log(photos[i]);
            console.log(`sukses upload foto ke ${i}`);
            if (fileName instanceof Array) await promises.unlink(fileName[i])
            i++
            if (i >= photos.length) clearInterval(neko)
        } catch (error) {
            if (fileName instanceof Array) await promises.unlink(fileName[i])
            clearInterval(neko)
            throw Error(error)
        }
    }, TIMEOUT); 
}

module.exports = {
    post
}