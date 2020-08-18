/**
 * 判断参数是否是其中之一
 */
export function oneOf(value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true;
    }
  }
  return false;
}

/**
 * 由一个组件，向上找到最近的指定组件
 */

export function findUpComponent(context, componentName) {
  let parent = context.$parent;
  let name = parent.$options.name;

  while (parent && (!name || [componentName].indexOf(name) < 0)) {
    parent = parent.$parent;
    if (parent) name = parent.$options.name;
  }
  return parent;
}


/**
 * 由一个组件，向上找到所有指定的组件
 */

export function findUpComponentList(context, componentName) {
  let parents = [];
  const parent = context.$parent;

  if (parent) {
    if (parent.$options.name === componentName) parents.push(parent);
    return parents.concat(findUpComponentList(parent, componentName));
  } else {
    return [];
  }
}

/**
 * 由一个组件，向下找到最近的指定组件
 */

export function findDownComponent(context, componentName) {
  const childrens = context.$children;
  let children = null;

  if (childrens.length) {
    for (const child of childrens) {
      const name = child.$options.name;

      if (name === componentName) {
        children = child;
        break;
      } else {
        children = findDownComponent(child, componentName);
        if (children) break;
      }
    }
  }

  return children;
}

/**
 * 由一个组件，向下找到所有指定的组件
 */

export function findDownComponentList(context, componentName) {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child);
    const foundChilds = findDownComponentList(child, componentName);
    return components.concat(foundChilds);
  }, []);
}

/**
 * 由一个组件，找到所有指定的兄弟组件。第三个参数表示 是否包含自己
 */

export function findBrotherComponentList(context, componentName, exceptMe = true) {
  let res = conext.$parent.$children.filter(item => {
    return item.$options.name === componentName;
  });

  if (exceptMe) {
    let index = res.findIndex(item => item._uid === context._uid);
    res.splice(index, 1);
  }
  return res;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait);
  }
}

/**
 * 判断对象是否相等
 */
export function equals(x, y) {
  var f1 = x instanceof Object;
  var f2 = y instanceof Object;
  if (!f1 || !f2) {
    return x === y
  }
  if (Object.keys(x).length !== Object.keys(y).length) {
    return false
  }
  Object.keys(x).forEach((p) => {
    var a = x[p] instanceof Object;
    var b = y[p] instanceof Object;
    if (a && b) {
      equals(x[p], y[p])
    } else if (x[p] !== y[p]) {
      return false;
    }

  });
  return true;

}

export function treeToList(nodes,  node_path = [], childs_key = 'childs') {
  if (!nodes) return [];
  let r = [];
  if (Array.isArray(nodes)) {
    for (var i = 0, l = nodes.length; i < l; i++) {
      let node = nodes[i];
      if (Array.isArray(node_path) && node_path.length > 0) {
        node._node_path_ = [...node_path, node];
      } else {
        node._node_path_ = [node];
      }
      node._node_level_ = node._node_path_.length;
      r.push(node);
      if (node[childs_key]) {
        r = r.concat(treeToList(node[childs_key], node._node_path_));
      }
    }
  } else {
    r.push(nodes);
    if (nodes[childs_key])
      r = r.concat(treeToList(nodes[childs_key]));
  }
  return r;
}

/**
 * scrollTop animation
 */
export function scrollTop(el, from = 0, to, duration = 500, endCallback) {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60);
      }
    );
  }
  const difference = Math.abs(from - to);
  const step = Math.ceil(difference / duration * 50);

  function scroll(start, end, step) {
    if (start === end) {
      endCallback && endCallback();
      return;
    }

    let d = (start + step > end) ? end : start + step;
    if (start > end) {
      d = (start - step < end) ? end : start - step;
    }

    if (el === window) {
      window.scrollTo(d, d);
    } else {
      el.scrollTop = d;
    }
    window.requestAnimationFrame(() => scroll(d, end, step));
  }

  scroll(from, to, step);
}
