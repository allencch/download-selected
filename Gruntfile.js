module.exports = grunt => {
  grunt.initConfig({
    watch: {
      ui: {
        files: ['src/ui/**/*.js'],
        tasks: ['concat']
      }
    },
    concat: {
      ui: {
        src: ['src/ui/lib/**/*.js', 'src/ui/index.js'],
        dest: 'src/ui.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['watch']);
};
