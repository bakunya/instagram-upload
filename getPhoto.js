const path = require("path")
const { promises } = require("fs")

const getPhotos = async ({client, first, after, username}) => {
    try {
        await client.login()
        const photosRaw = await client.getPhotosByUsername({ username, first, after})
        console.log(" sukses ambil data...\n");
        const photos = photosRaw.user.edge_owner_to_timeline_media.edges.map(img => ({img: img.node.display_url, isVideo: img.node.is_video}))
        await createJsonFile(photos)
        const info = photosRaw.user.edge_owner_to_timeline_media.page_info
        const json = toJson(info)
        const jsonImgPath = `${path.resolve()}/src/jsonImg/info.json`
        await promises.writeFile(jsonImgPath, json)
    } catch (e) {
        throw Error(e)
    }
}

const createJsonFile = async(photos) => {
    try {
        const length = photos.length > 10 ? Math.ceil(photos.length/10) : 1
        let i = 0
        let firstIndex = 0
        let lastIndex = 10
        while(i < length){
            let data =  photos.slice(firstIndex, lastIndex)
            let json = toJson(data)
            let jsonImgPath = `${path.resolve()}/src/jsonImg/photos${i}.json`
            console.log(` menyimpan photos${i}.json...\n`)
            await promises.writeFile(jsonImgPath, json)
            i ++
            firstIndex += 10
            lastIndex += 10
        }
    } catch (error) {
        throw Error(error)
    }
}

const toJson = (data) => JSON.stringify(data, null, 3)

module.exports = getPhotos