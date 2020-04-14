import { Swiper, Slide } from 'vue-swiper-component';
export default {
		name: 'QkImageCarousel', // 这个名字很重要，它就是未来的标签名<qk-text></qk-text>
		components: {
			Swiper,
			Slide
		},
		props: {
			imageSrcList: {
				type: Array,
				default: () => {
					return [
						'http://seopic.699pic.com/photo/50051/4111.jpg_wh1200.jpg',
						'http://seopic.699pic.com/photo/50051/4111.jpg_wh1200.jpg',
						'http://seopic.699pic.com/photo/50051/4111.jpg_wh1200.jpg'
					]
        }
			},
			interval: {
				type: Number,
				default: 2500
			}
		},
		render(h){
			const { imageSrcList, interval } = this._props;
			console.log("imageSrcList",imageSrcList)
			console.log("interval",interval)
			if(imageSrcList.length <=0 ){
				return (
					<div class="qk-image-carsousel">
					</div>
				)
			}
			return (
				<div class="qk-image-carsousel">
					<Swiper class="image-carsousel-swiper"  autoPlay='true' showIndicator='true' interval={interval} duration="500">
						{
							imageSrcList.map((item, index)=>{
								return (
									<Slide class="image-carsousel-slide" key={index}>
										<img  class="image-carsousel-image" src={item} alt="" />
									</Slide>
								)
							})
						}
				</Swiper>
				</div>
			)
		}
	}