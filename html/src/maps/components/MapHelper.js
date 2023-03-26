export default function getAllImages(maps) {
    let images = {};
    maps.forEach(map => {
        map.stage.elements.forEach(element => {
            if (element) {
                images[map._id] = {
                    id: element.id,
                    asset: element.asset,
                };
            }
        });
    });
    return images;
}
