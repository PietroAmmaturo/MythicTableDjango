/* eslint-disable */
import * as gridfinder from 'gridfinder';

describe('findGrid', () => {
    Object.entries({
        'perfect clicks': {
            sub: {
                '1': {
                    width: 100,
                    points: [
                        { x: 0, y: 0 },
                        { x: 100, y: 100 },
                        { x: 200, y: 200 },
                    ],
                },
                '2': {
                    width: 72,
                    points: [
                        { x: 0, y: 0 },
                        { x: 72, y: 144 },
                        { x: 288, y: 72 },
                    ],
                },
            },
        },
        'very good clicks': {
            width: 100,
            points: [
                { x: 0, y: 0 },
                { x: 110, y: 98 },
                { x: 312, y: 302 },
            ],
        },
        '60 perspective_inn': {
            bg: 'https://i.redd.it/9xy7jbjw4wv11.jpg',
            width: 60,
            sub: {
                refine_grid: {
                    points: [
                        { x: 595.977798334875, y: 428.898055242918 },
                        { x: 595.977798334875, y: 306.6018226234514 },
                        { x: 721.7187789084181, y: 306.6018226234514 },
                        { x: 721.7187789084181, y: 431.48177846727293 },
                    ],
                    sub: {
                        'half 1': {
                            points: [{ x: 657.1258094357077, y: 375.50110860624955 }],
                        },
                        'half 2': {
                            points: [{ x: 657.9870490286771, y: 429.75929631770305 }],
                        },
                    },
                },
                '1': {
                    points: [
                        { x: 1511.4754856614245, y: 1746.5968996639313 },
                        { x: 1580.3746530989824, y: 1917.9838735461417 },
                        { x: 1575.2072155411654, y: 2163.43757985986 },
                        { x: 1575.2072155411654, y: 1979.9932309306596 },
                        { x: 1637.2164662349676, y: 1919.7063556957116 },
                    ],
                },
                rectangular: {
                    shape: 'rect',
                    points: [
                        { x: 403.7346278317152, y: 174.7502656608301 },
                        { x: 463.9935275080906, y: 287.73535121740133 },
                    ],
                },
            },
        },
        '256 farmhouse': {
            bg: 'https://i.redd.it/m6l4go8l56v51.jpg',
            width: 256,
            sub: {
                min: {
                    points: [
                        { x: 2597.300613496932, y: 1813.9973492199026 },
                        { x: 5119.018404907975, y: 2562.9583759811503 },
                        { x: 5119.018404907975, y: 2830.9352571159084 },
                    ],
                },
                '1': {
                    points: [
                        // Too small.
                        { x: 5119.018404907975, y: 2830.935257115908 },
                        { x: 5112.147239263804, y: 2562.95837598115 },
                        { x: 3600.490797546012, y: 2549.215971820393 },
                    ],
                },
                bad: {
                    points: [
                        // Selects a too small grid!
                        { x: 1288.880666049953, y: 4604.322132248466 },
                        { x: 2573.617021276596, y: 1811.061000713393 },
                        { x: 3601.406105457909, y: 2557.035783615935 },
                    ],
                    sub: {
                        '+1': {
                            points: [{ x: 3601.406105457909, y: 2557.035783615935 }],
                        },
                        '+2': {
                            points: [
                                { x: 5114.079555966698, y: 1811.061000713393 },
                                { x: 4102.867715078631, y: 3332.020696964687 },
                            ],
                        },
                        '+a lot': {
                            // Lots and lots of points, good result.
                            points: [
                                { x: 5114.079555966698, y: 1811.061000713393 },
                                { x: 4102.867715078631, y: 3332.020696964687 },
                                { x: 3327.881591119334, y: 1790.3394789661 },
                                { x: 3601.406105457909, y: 3323.732088265769 },
                                { x: 2565.328399629972, y: 3323.732088265769 },
                                { x: 1284.736355226642, y: 3854.203044996466 },
                                { x: 2047.289546716003, y: 3858.347349345924 },
                                { x: 2043.145235892692, y: 4608.466436597925 },
                                { x: 2569.472710453284, y: 4608.466436597925 },
                                { x: 5114.079555966698, y: 2561.180087965393 },
                                { x: 5122.368177613321, y: 2822.271261981283 },
                                { x: 5114.079555966698, y: 3323.732088265769 },
                            ],
                        },
                    },
                },
            },
        },
        rectangular: {
            shape: 'rect',
            width: 10,
            height: 30,
            sub: {
                two: {
                    points: [
                        { x: 20, y: 30 },
                        { x: 10, y: 60 },
                    ],
                },
                three: {
                    points: [
                        { x: 20, y: 30 },
                        { x: 10, y: 60 },
                        { x: 40, y: 0 },
                    ],
                },
                offset: {
                    points: [
                        { x: 25, y: 35 },
                        { x: 15, y: 65 },
                    ],
                },
            },
        },
    }).forEach(function run([name, cfg]) {
        let { shape, bg, points = [], sub = {} } = cfg;

        if (points.length) {
            it(name, function() {
                expect(gridfinder.findGrid(points, { shape })).toMatchSnapshot();
            });
        }

        let subs = Object.entries(sub);
        describe(name, function() {
            for (let [sub_name, { points: p = [], ...rest }] of subs) {
                run([
                    sub_name,
                    {
                        ...cfg,

                        points: [...points, ...p],
                        sub: undefined,

                        ...rest,
                    },
                ]);
            }
        });

        expect(points.length || subs.length).toBeTruthy();
    });
});

describe('findOffset', () => {
    it('perfect', () => {
        expect(
            gridfinder.findOffset({
                cellSize: 99,
                points: [{ x: 0, y: 0 }],
            })).toEqual({ x: 0, y: 0 });
        expect(
            gridfinder.findOffset({
                cellSize: 99,
                points: [{ x: 10, y: 10 }],
            })).toEqual({ x: 10, y: 10 });
        expect(
            gridfinder.findOffset({
                cellSize: 100,
                points: [
                    { x: 98, y: 202 },
                    { x: 402, y: 298 },
                ],
            })).toEqual({ x: 0, y: 0 });
        expect(
            gridfinder.findOffset({
                cellSize: 100,
                points: [
                    { x: 103, y: 215 },
                    { x: 407, y: 311 },
                ],
            })).toEqual({ x: 5, y: 13 });
        expect(
            gridfinder.findOffset({
                cellSize: { width: 10, height: 20 },
                points: [
                    { x: 13, y: 23 },
                    { x: 11, y: 59 },
                ],
            })).toEqual({ x: 2, y: 1 });
    });
});
