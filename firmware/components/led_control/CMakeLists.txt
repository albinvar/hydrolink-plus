idf_component_register(
    SRCS "src/led_control.c"    # Specify the relative path to the source file
    INCLUDE_DIRS "include"     # Specify the directory containing the header files
    REQUIRES driver            # Add driver component dependency
)
