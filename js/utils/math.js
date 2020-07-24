export const lerp = function(start, target, easing){
    return start + (target - start) * easing;
};