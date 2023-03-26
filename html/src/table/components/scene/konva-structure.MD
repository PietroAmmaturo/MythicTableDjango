Jon's Simplified Structure: 
| Stage
    | Grid
        | ------- DrawingLayer ------ |
        | Token |  | Token |  | Token |
        | -------- GridLines -------- |
        | Map
            | --- GridFinderLayer --- |
            | -------- Image -------- |
        |
    |
|

Current Structure: 
| Stage ref: stage (Scene.vue)
    | Layer (Scene.vue)
        | Group ref: GridSpace (Scene.vue)
            | Group ref: MapSpace (Scene.vue)
                | Image(Konva) (MapImage.vue) |
                | Group ref: gridfinder (GridFinderLayer.vue)
                    | Group (conditionally rendered)
                        | Circle (list of grid-sizing circles) |
                    |
                |
            |
            | Rect ref: grid (renders grid lines) (GridLines.vue) |
            | Group (DrawingLayer.vue)
                | Group (render list of shapes with drawer) (DrawingLayer.vue)
                    | Line (render list of lines from list of shapes) |
                |
            |
            | Play Token TODO (PlayToken.vue) |
        |
    |
|