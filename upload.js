const {instagram, checkDir} = require("./helper")
const {promises} = require("fs")
const getPhoto = require("./getPhoto")
const {post} = require("./post")
const {question, rl} = require("./readline")
const path = require("path")
const fs = require("fs")

const printTitle = () => {
    console.log(" ############################ ")
    console.log(" ####   AUTO UPLOAD IG   #### ")
    console.log(" ####                    #### ")
    console.log("\n     Created by: miKu~cyan\n");
    console.log(" WARNING :: perhatikan capitalize/key sensitive\n")
    console.log(" 1. Masukan caption di folder 'src/caption/' \n   dengan nama 'caption.txt' extensi .txt\n");
    console.log(" 2. Panjang caption tidak boleh lebih dari 2100 karakter\n   dan banyak hastag tidak boleh lebih dari 30\n");
    console.log(" 3. Masukan image di folder 'src/img/' \n   dengan extensi .jpeg\n");
}

const createConfig = async () => {
    try {
        const {username, password} = require(`${path.resolve()}/src/account/account.json`)
        const client = instagram({username, password})
        const captionPath = await promises.readdir("./src/caption/")
        const caption = captionPath.length ? (await promises.readFile("./src/caption/caption.txt")).toString() : ""
        return {
            caption,
            client
        }
    } catch (e) {
        throw Error(e)
    }
}

const uploadPhoto = async (listPhotoFile) => {
    try {
        const getConfig = await createConfig()
        const photo = listPhotoFile.pop()
        const photoPath = `${path.join()}/src/jsonImg/${photo}`
        const photoFile = require(photoPath)
        const photos = photoFile.filter(img => !img.isVideo).map(img => img.img)
        const postPhotoConfig = {photos, ...getConfig, fileName: photoPath}
        await post(postPhotoConfig)
        await promises.unlink(photoPath)
    } catch (e) {
        throw Error(e)
    }
}

const checkCaption = async () => {
    try {
        const captionFile = await promises.readdir("./src/caption")
        if(captionFile.length){
            const caption = (await promises.readFile("./src/caption/caption.txt")).toString()
            if(caption.split("#").length >= 31 && caption.length >= 2100){
                throw Error(`panjang melebihi batas, panjang caption ${caption.length} banyak hastag ${caption.split("#").length - 1}`)
            }
            return
        }
    } catch (e) {
        throw Error(e)
    }
}

const getPhotoFromUserTarget = async () => {
    try {
        const cacheUserTargetPath = `${path.resolve()}/src/accountTarget`
        const cacheInfoPath = `${path.resolve()}/src/jsonImg`
        const infoDir = await getCached(cacheUserTargetPath)
        const configTanyaCache = {
            cb: isiAkun,
            cached: infoDir,
            questions: ["user_target_foto_instagram"],
        }
        const infoAccount = await tanyaPakaiCache(configTanyaCache)
        if (infoAccount !== undefined) {
            const data = JSON.stringify(infoAccount, null, 3)
            await promises.writeFile(`${cacheUserTargetPath}/target.json`, data)
        }
        const {user_target_foto_instagram} = require("./src/accountTarget/target.json")
        const infoExists = await promises.readdir(cacheInfoPath)
        if (!infoExists.includes("info.json")) {
            const data = JSON.stringify({end_cursor: "", has_next_page: true})
            fs.writeFileSync(`${cacheInfoPath}/info.json`, data)
        }
        const {end_cursor, has_next_page} = require("./src/jsonImg/info.json")
        const {client} = await createConfig()
        const getPhotoConfig = {
            client,
            username: user_target_foto_instagram,
            first: 50,
            after: end_cursor
        }
        if (has_next_page) {
            console.log("\n Mulai mengambil data...")
            await getPhoto(getPhotoConfig)
        } else {
            throw Error("Foto user target telah habis")
        }
    } catch (e) {
        throw Error(e)
    }
}

const uploadFromDifferentInstagramUser = async() => {
    try {
        const jsonPath = `${path.resolve()}/src/jsonImg`
        const listAllFile = await promises.readdir(jsonPath)
        const listPhotoFile = listAllFile.filter(file => file !== "info.json")
        if(listPhotoFile.length){
            await uploadPhoto(listPhotoFile)
        } else {
            await getPhotoFromUserTarget()   
        }
    } catch (e) {
        throw Error(e)
    }
}

const uploadFromDir = async() => {
    try {
        const getConfig = await createConfig()
        const photoPath = `${path.resolve()}/src/img`
        const listAllFile = await promises.readdir(photoPath)
        const photos = listAllFile.map(img => `${path.resolve()}/src/img/${img}`)
        if (!photos.length) throw new Error("Images not Found in IMG directories")
        const postPhotoConfig = {photos, ...getConfig, fileName: photos}
        await post(postPhotoConfig)
    } catch (e) {
        throw Error(e)
    }
}

const isiAkun = async ({questions}) => {
    try {
        console.log(" Isi dulu bruh...")
        const answers = {}
        for (const quest of questions) {
            let lolos = true
            while (lolos) {
                const answer = await question(` ${quest}: `)
                if (answer.length) {
                    Object.assign(answers, {[quest]: answer})
                    lolos = false
                } else {
                    console.log(" WARNING: Isi data yg benar!!\n")
                }
            }                
        }
        return answers
    } catch (e) {
        throw Error(e)
    }
}

const getCached = async (path) => {
    try {
        const cached = await promises.readdir(path)
        return cached
    } catch (e) {
        throw Error(e)
    }    
}

const tanyaPakaiCache = async ({cb, cached, questions}) => {
    if (cached.length) {
        const useCache = await question(" pakai data sebelumnya? Y/n \n ")
        if (useCache === "n") {
            console.log("\n silahkan isi data...")
            const data = await cb({questions})
            return data
        }
    } else {
        const data = await cb({questions})
        return data
    }
}

// MAIN METHOD ()

;(async () => {
    try {
        printTitle()
        await checkDir()
        const accountCachePath = `${path.resolve()}/src/account`
        const getCachedLogin = await getCached(accountCachePath)
        const configTanyaCache = {
            cb: isiAkun,
            cached: getCachedLogin,
            questions: ["username", "password"],
        }
        const cacheAccount = await tanyaPakaiCache(configTanyaCache)
        if (cacheAccount !== undefined) {
            const data = JSON.stringify(cacheAccount, null, 3)
            await promises.writeFile(`${accountCachePath}/account.json`, data)
        }
        await checkCaption()
        const ans = await question("\n upload gambar lewat mana? \n 1. foto instagram user lain \n 2. foto dari folder \n ")
        switch (ans) {
            case "1":
                await uploadFromDifferentInstagramUser()
                break;
            case "2":
                await uploadFromDir()
                break;
            default:
                console.log("\n input tidak cocok\n masukan nomor saja. \n");
                rl.close()
                break;
        }
        rl.close()
    } catch (e) {
        console.log(e);
        console.log("\n close, BYE...")
        rl.close()
    }
})()

