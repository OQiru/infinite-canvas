import TextNode from './TextNode.jsx'
import ImageNode from './ImageNode.jsx'
import VideoNode from './VideoNode.jsx'
import GenerateNode from './GenerateNode.jsx'

export const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  video: VideoNode,
  t2i: GenerateNode,
  i2i: GenerateNode,
  t2v: GenerateNode,
  i2v: GenerateNode,
  f2v: GenerateNode,
}
