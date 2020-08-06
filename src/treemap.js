const getMaximum = (array) => Math.max(... array);

const getMinimum = (array) => Math.min(... array);

const sumReducer = (acc, cur) => acc + cur;

const worstRatio = (rows, width) => {
    const sum = rows.reduce(sumReducer, 0);
    const rowMax = getMaximum(rows);
    const rowMin = getMinimum(rows);
    return Math.max(((width ** 2) * rowMax) / (sum ** 2), (sum ** 2) / ((width ** 2) * rowMin));
};
  
class Treemap {
    constructor(width, height, data) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.xBeginning = 0;
        this.yBeginning = 0;
        this.list = [];
    }

    getMinWidth() {
        if (this.height ** 2 > this.width ** 2) {
            return this.width;
        }
        return this.height;
    }

    isVertical() {
        if (this.height ** 2 > this.width ** 2) {
            return false;
        }
        return true;
    }
    
    layoutRow(rows, width, vertical) {
        const rowHeight = rows.reduce(sumReducer, 0) / width;
    
        rows.forEach((rowItem) => {
            const rowWidth = rowItem / rowHeight;
            let data;
            if (vertical) {
                data = {
                    x: this.xBeginning,
                    y: this.yBeginning,
                    w: rowHeight,
                    h: rowWidth,
                    data: this.data[this.list.length]
                };
                this.yBeginning += rowWidth;
            } else {
                data = {
                    x: this.xBeginning,
                    y: this.yBeginning,
                    w: rowWidth,
                    h: rowHeight,
                    data: this.data[this.list.length]
                };
                this.xBeginning += rowWidth;
            }
    
            this.list.push(data);
        });
    
        if (vertical) {
            this.xBeginning += rowHeight;
            this.yBeginning -= width;
            this.width -= rowHeight;
        } else {
            this.xBeginning -= width;
            this.yBeginning += rowHeight;
            this.height -= rowHeight;
        }
    }
    
    layoutLastRow(rows, subs, width) {
        const vertical = this.isVertical();
        this.layoutRow(rows, width, vertical);
        this.layoutRow(subs, width, vertical);
    }
    
    calculate(subs, rows, width) {
        if (subs.length === 1) {
            return this.layoutLastRow(rows, subs, width);
        }
    
        const rowsWithChild = [... rows, subs[0]];
        if (rows.length === 0 || worstRatio(rows, width) >= worstRatio(rowsWithChild, width)) {
            subs.shift();
            return this.calculate(subs, rowsWithChild, width);
        }

        this.layoutRow(rows, width, this.isVertical());
        return this.calculate(subs, [], this.getMinWidth());
    }

    getList() {

        const totalValue = this.data.map((dataPoint) => dataPoint.value).reduce(sumReducer, 0);
        const dataScaled = this.data.map((dataPoint) => (dataPoint.value * this.height * this.width) / totalValue);
      
        this.calculate(dataScaled, [], this.getMinWidth());
    
        return this.list;
    }

}

module.exports = Treemap;